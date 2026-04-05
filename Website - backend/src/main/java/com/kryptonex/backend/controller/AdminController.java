package com.kryptonex.backend.controller;

import com.kryptonex.backend.response.ApiResponse;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Void>> login(@RequestBody LoginRequest request) {
        if ("kryptonex".equals(request.getUsername()) && "kryptonex@1211".equals(request.getPassword())) {
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("Login successful")
                    .build());
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message("Invalid credentials")
                        .build());
    }
}
