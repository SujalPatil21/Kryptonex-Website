package com.platform.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Map;

@Data
public class TestCaseRequest {
    private Map<String, Object> inputJson;
    private String expectedOutputJson;

    @JsonProperty("isHidden")
    private boolean isHidden;
}
