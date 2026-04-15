package com.platform.judge.parser;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.entity.Parameter;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class InputParser {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String parseInput(Map<String, Object> inputMap, List<Parameter> parameters, String language) throws Exception {
        StringBuilder code = new StringBuilder();
        
        for (Parameter param : parameters) {
            String name = param.getName();
            String type = param.getType();
            Object value = inputMap.get(name);
            
            if (value == null) {
                throw new IllegalArgumentException("Missing parameter in test case input: " + name);
            }
            
            String declaration = generateDeclaration(name, type, value, language);
            code.append(declaration).append("\n");
        }
        
        return code.toString();
    }
    
    private String generateDeclaration(String name, String type, Object value, String language) throws Exception {
        String jsonVal = objectMapper.writeValueAsString(value);
        
        switch (language.toLowerCase()) {
            case "java":
                return generateJavaDeclaration(name, type, jsonVal);
            case "python":
                return generatePythonDeclaration(name, type, jsonVal);
            case "c++":
                return generateCppDeclaration(name, type, jsonVal);
            default:
                throw new IllegalArgumentException("Unsupported language: " + language);
        }
    }
    
    private String generateJavaDeclaration(String name, String type, String jsonVal) {
        switch (type.toLowerCase()) {
            case "int":
                return "int " + name + " = " + jsonVal + ";";
            case "string":
                return "String " + name + " = " + jsonVal + ";";
            case "int_array":
                return "int[] " + name + " = new int[]" + jsonVal.replace("[", "{").replace("]", "}") + ";";
            case "string_array":
                return "String[] " + name + " = new String[]" + jsonVal.replace("[", "{").replace("]", "}") + ";";
            default:
                return "Object " + name + " = " + jsonVal + ";";
        }
    }
    
    private String generatePythonDeclaration(String name, String type, String jsonVal) {
        return name + " = " + jsonVal;
    }
    
    private String generateCppDeclaration(String name, String type, String jsonVal) {
        switch (type.toLowerCase()) {
            case "int":
                return "int " + name + " = " + jsonVal + ";";
            case "string":
                return "string " + name + " = " + jsonVal + ";";
            case "int_array":
                return "vector<int> " + name + " = " + jsonVal.replace("[", "{").replace("]", "}") + ";";
            case "string_array":
                return "vector<string> " + name + " = " + jsonVal.replace("[", "{").replace("]", "}") + ";";
            default:
                return "auto " + name + " = " + jsonVal + ";";
        }
    }
}
