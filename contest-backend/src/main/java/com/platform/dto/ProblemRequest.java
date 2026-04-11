package com.platform.dto;

import com.platform.entity.enums.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProblemRequest {
    @NotBlank(message = "Title cannot be blank")
    private String title;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    @NotNull(message = "Difficulty cannot be null")
    private Difficulty difficulty;

    private String constraints;
    
    @NotNull(message = "Time limit cannot be null")
    private Integer timeLimit;
    
    @NotBlank(message = "Function name cannot be blank")
    private String functionName;

    @NotBlank(message = "Parameter types cannot be blank")
    private String parameterTypes;

    @NotBlank(message = "Return type cannot be blank")
    private String returnType;
    
    private String sampleInput;
    private String sampleOutput;
}
