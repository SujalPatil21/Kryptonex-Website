package com.platform.service;

import com.platform.dto.TestCaseRequest;
import com.platform.dto.TestCaseResponse;
import com.platform.entity.Problem;
import com.platform.entity.TestCase;
import com.platform.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final ProblemService problemService;

    public TestCaseResponse createTestCase(Long problemId, TestCaseRequest request) {
        Problem problem = problemService.getProblemEntityById(problemId);

        TestCase testCase = TestCase.builder()
                .problem(problem)
                .input(request.getInput())
                .output(request.getOutput())
                .isHidden(request.isHidden())
                .build();

        TestCase saved = testCaseRepository.save(testCase);

        return TestCaseResponse.builder()
                .id(saved.getId())
                .problemId(problem.getId())
                .input(saved.getInput())
                .output(saved.getOutput())
                .isHidden(saved.isHidden())
                .build();
    }
}
