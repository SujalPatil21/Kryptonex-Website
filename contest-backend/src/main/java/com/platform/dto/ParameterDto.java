package com.platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParameterDto {
    @NotBlank(message = "Parameter name cannot be blank")
    private String name;

    @NotBlank(message = "Parameter type cannot be blank")
    private String type;
}
