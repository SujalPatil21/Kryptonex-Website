package com.platform.service;

import com.platform.dto.SubmissionRequest;
import com.platform.dto.SubmissionResponse;
import com.platform.entity.*;
import com.platform.entity.enums.SubmissionStatus;
import com.platform.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * SubmissionService
 *
 * FIXES vs original:
 *  1. Score was binary (100 or 0). Now calculated as:
 *         Math.round((passedCount / totalCount) * 100)
 *     so partial credit is awarded.
 *  2. EvaluationResult now carries passedCount + totalCount
 *     which are used for the score calculation.
 *  3. verdictMessage is persisted to help users understand the result.
 */
@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final UserService          userService;
    private final ContestService       contestService;
    private final ProblemService       problemService;
    private final CodeExecutionService codeExecutionService;

    // ------------------------------------------------------------------ //
    //  Submit                                                              //
    // ------------------------------------------------------------------ //

    @Transactional
    public SubmissionResponse submit(Long contestId, SubmissionRequest request) {
        if (request.getUserId() == null) {
            throw new RuntimeException("User ID missing");
        }

        try {
            // ---- Resolve domain objects -----------------------------------
            User    user    = userService.getUserEntityById(request.getUserId());
            Contest contest = contestService.getContestEntityById(contestId);
            Problem problem = problemService.getProblemEntityById(request.getProblemId());

            // ---- Run judge -----------------------------------------------
            CodeExecutionService.EvaluationResult evalResult = codeExecutionService.evaluate(
                    problem,
                    request.getCode(),
                    request.getLanguage()
            );

            // ---- Calculate score -----------------------------------------
            // Partial credit: proportion of passed test cases × 100
            int score = calculateScore(evalResult.getPassedCount(), evalResult.getTotalCount());

            // ---- Persist submission --------------------------------------
            Submission submission = Submission.builder()
                    .user(user)
                    .problem(problem)
                    .contest(contest)
                    .code(request.getCode())
                    .language(request.getLanguage())
                    .status(evalResult.getStatus())
                    .verdictMessage(evalResult.getVerdictMessage())
                    .score(score)
                    .executionTime(evalResult.getTotalExecutionTime())
                    .build();

            Submission saved = submissionRepository.save(submission);
            return mapToResponse(saved);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Submission failed: " + e.getMessage());
        }
    }

    // ------------------------------------------------------------------ //
    //  Queries                                                             //
    // ------------------------------------------------------------------ //

    public List<SubmissionResponse> getUserSubmissions(Long userId) {
        return submissionRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------ //
    //  Private helpers                                                     //
    // ------------------------------------------------------------------ //

    /**
     * Calculate a 0–100 score based on passed / total test cases.
     * Returns 0 when totalCount is 0 to avoid division-by-zero.
     */
    private int calculateScore(int passedCount, int totalCount) {
        if (totalCount == 0) return 0;
        return (int) Math.round((double) passedCount / totalCount * 100);
    }

    private SubmissionResponse mapToResponse(Submission submission) {
        return SubmissionResponse.builder()
                .id(submission.getId())
                .userId(submission.getUser().getId())
                .problemId(submission.getProblem().getId())
                .contestId(submission.getContest().getId())
                .language(submission.getLanguage())
                .status(submission.getStatus())
                .verdictMessage(submission.getVerdictMessage())
                .score(submission.getScore())
                .executionTime(submission.getExecutionTime())
                .submittedAt(submission.getSubmittedAt())
                .build();
    }
}
