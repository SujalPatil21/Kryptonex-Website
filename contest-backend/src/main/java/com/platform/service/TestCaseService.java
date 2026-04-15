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
        System.out.println("=== SERVICE LAYER DEBUG ===");
        System.out.println("SERVICE INPUT JSON: " + request.getInputJson());
        System.out.println("SERVICE EXPECTED OUTPUT: " + request.getExpectedOutputJson());

        Problem problem = problemService.getProblemEntityById(problemId);
        System.out.println("PROBLEM FOUND: " + problem.getId() + " - " + problem.getTitle());

        TestCase testCase = TestCase.builder()
                .problem(problem)
                .inputJson(request.getInputJson())
                .expectedOutputJson(request.getExpectedOutputJson())
                .isHidden(request.isHidden())
                .build();

        System.out.println("ENTITY BUILT - attempting save...");

        TestCase saved;
        try {
            saved = testCaseRepository.save(testCase);
            System.out.println("SAVE SUCCESS - ID: " + saved.getId());
        } catch (Exception e) {
            System.out.println("=== SAVE FAILED ===");
            e.printStackTrace();
            throw e;
        }

        return TestCaseResponse.builder()
                .id(saved.getId())
                .problemId(problem.getId())
                .inputJson(saved.getInputJson())
                .expectedOutputJson(saved.getExpectedOutputJson())
                .isHidden(saved.isHidden())
                .build();
    }
}
