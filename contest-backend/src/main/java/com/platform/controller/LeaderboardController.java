package com.platform.controller;

import com.platform.dto.LeaderboardResponse;
import com.platform.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contests/{id}/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<List<LeaderboardResponse>> getLeaderboard(@PathVariable Long id) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard(id));
    }
}
