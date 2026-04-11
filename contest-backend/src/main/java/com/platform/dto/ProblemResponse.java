package com.platform.dto;

import com.platform.entity.enums.Difficulty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProblemResponse {
    private Long id;
    private Long contestId;
    private String title;
    private String description;
    private Difficulty difficulty;
    private String constraints;
    private Integer timeLimit;
    private String sampleInput;
    private String sampleOutput;
    private String functionName;
    private String parameterTypes;
    private String returnType;
}
