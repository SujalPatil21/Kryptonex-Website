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
        return new ResponseEntity<>(testCaseService.createTestCase(problemId, request), HttpStatus.CREATED);
    }
}
