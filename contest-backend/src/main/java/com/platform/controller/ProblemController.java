package com.platform.controller;

import com.platform.dto.ProblemRequest;
import com.platform.dto.ProblemResponse;
import com.platform.service.ProblemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    @PostMapping("/contests/{contestId}/problems")
    public ResponseEntity<ProblemResponse> createProblem(
            @PathVariable Long contestId,
            @Valid @RequestBody ProblemRequest request) {
        return new ResponseEntity<>(problemService.createProblem(contestId, request), HttpStatus.CREATED);
    }

    @GetMapping("/contests/{contestId}/problems")
    public ResponseEntity<List<ProblemResponse>> getProblemsByContestId(@PathVariable Long contestId) {
        return ResponseEntity.ok(problemService.getProblemsByContestId(contestId));
    }

    @GetMapping("/problems/{id}")
    public ResponseEntity<ProblemResponse> getProblemById(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }
}
