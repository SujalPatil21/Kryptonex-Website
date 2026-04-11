package com.platform.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TestCaseResponse {
    private Long id;
    private Long problemId;
    private String input;
    private String output;
    private boolean isHidden;
}
