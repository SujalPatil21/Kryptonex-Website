package com.platform.service;

import com.platform.dto.LeaderboardResponse;
import com.platform.entity.Contest;
import com.platform.entity.Submission;
import com.platform.entity.enums.SubmissionStatus;
import com.platform.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final SubmissionRepository submissionRepository;
    private final ContestService contestService;

    @Transactional
    public List<LeaderboardResponse> getLeaderboard(Long contestId) {
        Contest contest = contestService.getContestEntityById(contestId);
        
        // Optimized JOIN FETCH query
        List<Submission> submissions = submissionRepository.findByContestIdWithUser(contestId);

        // Group by User
        Map<Long, List<Submission>> byUser = submissions.stream()
                .collect(Collectors.groupingBy(s -> s.getUser().getId()));

        List<LeaderboardResponse> leaderboard = new ArrayList<>();

        for (Map.Entry<Long, List<Submission>> entry : byUser.entrySet()) {
            Long userId = entry.getKey();
            List<Submission> userSubs = entry.getValue();
            String username = userSubs.get(0).getUser().getUsername();

            // Group by Problem to find best submission per problem
            Map<Long, List<Submission>> byProblem = userSubs.stream()
                    .collect(Collectors.groupingBy(s -> s.getProblem().getId()));

            int totalScore = 0;
            long penaltyTime = 0;
            int problemsSolved = 0;

            for (List<Submission> probSubs : byProblem.values()) {
                // Find first accepted
                Optional<Submission> firstAccepted = probSubs.stream()
                        .filter(s -> s.getStatus() == SubmissionStatus.ACCEPTED)
                        .min(Comparator.comparing(Submission::getSubmittedAt));

                if (firstAccepted.isPresent()) {
                    Submission acc = firstAccepted.get();
                    totalScore += 100;
                    problemsSolved++;
                    
                    // Time penalty in seconds from contest start
                    long submitEpoch = acc.getSubmittedAt().toEpochSecond(ZoneOffset.UTC);
                    long startEpoch = contest.getStartTime().toEpochSecond();
                    penaltyTime += Math.max(0, submitEpoch - startEpoch);
                }
            }

            leaderboard.add(LeaderboardResponse.builder()
                    .userId(userId)
                    .username(username)
                    .score(totalScore)
                    .time(penaltyTime)
                    .problemsSolved(problemsSolved)
                    .build());
        }

        // Sort by score DESC, then time ASC
        leaderboard.sort((a, b) -> {
            if (a.getScore() != b.getScore()) {
                return Integer.compare(b.getScore(), a.getScore());
            }
            return Long.compare(a.getTime(), b.getTime());
        });

        // Assign ranks
        int rank = 1;
        for (LeaderboardResponse node : leaderboard) {
            node.setRank(rank++);
        }

        return leaderboard;
    }
}

