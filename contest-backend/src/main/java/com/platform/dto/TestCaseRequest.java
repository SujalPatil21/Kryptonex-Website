package com.platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TestCaseRequest {
    private String input;
    private String output;
    private boolean isHidden;
}
