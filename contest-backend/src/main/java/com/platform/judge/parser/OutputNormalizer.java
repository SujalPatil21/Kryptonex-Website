package com.platform.judge.parser;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OutputNormalizer {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Object normalize(String output, String returnType) {
        if (output == null || output.trim().isEmpty()) {
            if (returnType.endsWith("array")) return List.of();
            return "";
        }

        // Clean output of any erratic whitespaces completely, preserving inside strings if needed, 
        // but typically leetcode simple outputs are safe to strip. 
        // Actually, let's rely on JSON parser to handle spacing.
        String jsonFormat = output.trim();
        
        try {
            switch (returnType.toLowerCase()) {
                case "int":
                    return Integer.parseInt(jsonFormat);
                case "string":
                    // If it's a raw string not wrapped in quotes, wrap it for consistent parsing or return as is.
                    // Output from judge is usually raw. Let's return raw trimmed.
                    if (jsonFormat.startsWith("\"") && jsonFormat.endsWith("\"")) {
                        return objectMapper.readValue(jsonFormat, String.class);
                    }
                    return jsonFormat;
                case "int_array":
                    return objectMapper.readValue(jsonFormat, new TypeReference<List<Integer>>() {});
                case "string_array":
                    return objectMapper.readValue(jsonFormat, new TypeReference<List<String>>() {});
                default:
                    return jsonFormat;
            }
        } catch (JsonProcessingException | NumberFormatException e) {
            // If parsing fails (e.g., malformed array string), return raw string
            return jsonFormat.replaceAll("\\s+", "");
        }
    }
}
