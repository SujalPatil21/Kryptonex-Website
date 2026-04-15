package com.platform.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Parameter {
    private String name;
    private String type; // e.g. "int", "int_array", "string", "string_array"
}
