package com.platform.service;

import com.platform.dto.ContestRequest;
import com.platform.dto.ContestResponse;
import com.platform.entity.Contest;
import com.platform.entity.User;
import com.platform.exception.ResourceNotFoundException;
import com.platform.repository.ContestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContestService {

    private final ContestRepository contestRepository;
    private final UserService userService;

    public ContestResponse createContest(ContestRequest request) {
        User createdBy = userService.getUserEntityById(request.getCreatedBy());

        Contest contest = Contest.builder()
                .title(request.getTitle())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .createdBy(createdBy)
                .build();

        Contest saved = contestRepository.save(contest);
        return mapToResponse(saved);
    }

    public List<ContestResponse> getAllContests() {
        return contestRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ContestResponse getContestById(Long id) {
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contest not found with id: " + id));
        return mapToResponse(contest);
    }

    public Contest getContestEntityById(Long id) {
        return contestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contest not found with id: " + id));
    }

    private ContestResponse mapToResponse(Contest contest) {
        return ContestResponse.builder()
                .id(contest.getId())
                .title(contest.getTitle())
                .startTime(contest.getStartTime())
                .endTime(contest.getEndTime())
                .status(contest.getStatus())
                .createdBy(contest.getCreatedBy().getId())
                .build();
    }
}
