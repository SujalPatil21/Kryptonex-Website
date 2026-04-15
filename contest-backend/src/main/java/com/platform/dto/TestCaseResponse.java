package com.platform.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class TestCaseResponse {
    private Long id;
    private Long problemId;
    private Map<String, Object> inputJson;
    private String expectedOutputJson;

    @JsonProperty("isHidden")
    private boolean isHidden;
}
