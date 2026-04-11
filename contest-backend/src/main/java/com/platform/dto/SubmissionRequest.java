package com.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmissionRequest {
    @NotNull(message = "User ID cannot be null")
    private Long userId;

    @NotNull(message = "Problem ID cannot be null")
    private Long problemId;

    @NotBlank(message = "Code cannot be blank")
    private String code;

    @NotBlank(message = "Language cannot be blank")
    private String language;
}
