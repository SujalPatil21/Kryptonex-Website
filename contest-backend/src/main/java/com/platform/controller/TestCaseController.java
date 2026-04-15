package com.platform.controller;

import com.platform.dto.TestCaseRequest;
import com.platform.dto.TestCaseResponse;
import com.platform.service.TestCaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TestCaseController {

    private final TestCaseService testCaseService;

    @PostMapping("/problems/{problemId}/testcases")
    public ResponseEntity<TestCaseResponse> createTestCase(
            @PathVariable Long problemId,
            @Valid @RequestBody TestCaseRequest request) {

        System.out.println("=== TESTCASE CREATION DEBUG ===");
        System.out.println("PROBLEM ID: " + problemId);
        System.out.println("RAW REQUEST: " + request);
        System.out.println("INPUT JSON: " + request.getInputJson());
        System.out.println("INPUT JSON TYPE: " + (request.getInputJson() != null ? request.getInputJson().getClass().getName() : "NULL"));
        System.out.println("EXPECTED OUTPUT: " + request.getExpectedOutputJson());
        System.out.println("EXPECTED OUTPUT TYPE: " + (request.getExpectedOutputJson() != null ? request.getExpectedOutputJson().getClass().getName() : "NULL"));
        System.out.println("IS HIDDEN: " + request.isHidden());

        return new ResponseEntity<>(testCaseService.createTestCase(problemId, request), HttpStatus.CREATED);
    }
}
