package com.platform.controller;

import com.platform.dto.SubmissionRequest;
import com.platform.dto.SubmissionResponse;
import com.platform.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping("/contests/{contestId}/submit")
    public ResponseEntity<SubmissionResponse> submit(
            @PathVariable Long contestId,
            @Valid @RequestBody SubmissionRequest request) {
        return new ResponseEntity<>(submissionService.submit(contestId, request), HttpStatus.CREATED);
    }

    @GetMapping("/submissions/user/{userId}")
    public ResponseEntity<List<SubmissionResponse>> getUserSubmissions(@PathVariable Long userId) {
        return ResponseEntity.ok(submissionService.getUserSubmissions(userId));
    }
}
