package com.platform.service;

import com.platform.dto.ProblemRequest;
import com.platform.dto.ProblemResponse;
import com.platform.entity.Contest;
import com.platform.entity.Problem;
import com.platform.entity.Parameter;
import com.platform.exception.ResourceNotFoundException;
import com.platform.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final ContestService contestService;

    public ProblemResponse createProblem(Long contestId, ProblemRequest request) {
        Contest contest = contestService.getContestEntityById(contestId);

        Problem problem = Problem.builder()
                .contest(contest)
                .title(request.getTitle())
                .description(request.getDescription())
                .difficulty(request.getDifficulty())
                .constraints(request.getConstraints())
                .timeLimit(request.getTimeLimit())
                .sampleInput(request.getSampleInput())
                .sampleOutput(request.getSampleOutput())
                .functionName(request.getFunctionName())
                .parameters(request.getParameters().stream()
                        .map(p -> new Parameter(p.getName(), p.getType()))
                        .collect(Collectors.toList()))
                .returnType(request.getReturnType())
                .build();

        Problem saved = problemRepository.save(problem);
        return mapToResponse(saved);
    }

    public List<ProblemResponse> getProblemsByContestId(Long contestId) {
        // Just verify contest exists
        contestService.getContestEntityById(contestId);

        return problemRepository.findByContestId(contestId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProblemResponse getProblemById(Long id) {
        Problem problem = getProblemEntityById(id);
        return mapToResponse(problem);
    }

    public Problem getProblemEntityById(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + id));
    }

    private ProblemResponse mapToResponse(Problem problem) {
        return ProblemResponse.builder()
                .id(problem.getId())
                .contestId(problem.getContest().getId())
                .title(problem.getTitle())
                .description(problem.getDescription())
                .difficulty(problem.getDifficulty())
                .constraints(problem.getConstraints())
                .timeLimit(problem.getTimeLimit())
                .sampleInput(problem.getSampleInput())
                .sampleOutput(problem.getSampleOutput())
                .functionName(problem.getFunctionName())
                .returnType(problem.getReturnType())
                .build();
    }
}
