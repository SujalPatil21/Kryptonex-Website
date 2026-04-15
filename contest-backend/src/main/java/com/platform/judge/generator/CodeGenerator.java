package com.platform.judge.generator;

import com.platform.entity.Problem;
import com.platform.entity.Parameter;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CodeGenerator {

    public String generateCode(Problem problem, String userCode, String parsedInputs, String language) {
        switch (language.toLowerCase()) {
            case "java":
                return generateJavaCode(problem, userCode, parsedInputs);
            case "python":
                return generatePythonCode(problem, userCode, parsedInputs);
            case "c++":
                return generateCppCode(problem, userCode, parsedInputs);
            default:
                throw new IllegalArgumentException("Unsupported language: " + language);
        }
    }

    private String generateJavaCode(Problem problem, String userCode, String parsedInputs) {
        if (userCode == null || userCode.trim().isEmpty()) {
            throw new RuntimeException("User code injection failed");
        }

        String rawReturnType = problem.getReturnType();
        String normalizedReturnType = rawReturnType.replaceAll("\\s+", "");
        
        String functionName = problem.getFunctionName();
        List<Parameter> parameters = problem.getParameters();
        String argsList = parameters.stream().map(Parameter::getName).collect(Collectors.joining(", "));

        String javaReturnType = getJavaReturnType(normalizedReturnType);
        String printStatement = getJavaPrintStatement(normalizedReturnType);

        StringBuilder sb = new StringBuilder();
        sb.append("import java.util.*;\n");
        sb.append("import java.io.*;\n");
        sb.append("import java.math.*;\n\n");
        
        sb.append("class Solution {\n");
        sb.append(userCode).append("\n");
        sb.append("}\n\n");
        
        sb.append("public class Main {\n");
        sb.append("    public static void main(String[] args) {\n");
        sb.append("        ").append(parsedInputs.replace("\n", "\n        ")).append("\n");
        sb.append("        Solution sol = new Solution();\n");
        sb.append("        ").append(javaReturnType).append(" result = sol.").append(functionName).append("(").append(argsList).append(");\n");
        sb.append("        ").append(printStatement.replace("\n", "\n        ")).append("\n");
        sb.append("    }\n");
        sb.append("}\n");

        String generatedCode = sb.toString();

        // VALIDATIONS
        if (!generatedCode.contains("class Solution")) {
            throw new RuntimeException("Solution class missing");
        }
        if (!generatedCode.contains("public class Main")) {
            throw new RuntimeException("Main class missing");
        }
        if (!generatedCode.matches("(?s).*\\b" + functionName + "\\s*\\(.*")) {
            throw new RuntimeException("User method not found in generated code");
        }
        if (!generatedCode.contains("sol." + functionName + "(")) {
            throw new RuntimeException("Method call generation failed");
        }
        if (!generatedCode.matches("(?s).*\\breturn\\b.*") && !normalizedReturnType.equals("void")) {
            throw new RuntimeException("Missing return statement");
        }

        int openBraces = (int) countOccurrences(generatedCode, '{');
        int closeBraces = (int) countOccurrences(generatedCode, '}');
        if (openBraces != closeBraces) {
            throw new RuntimeException("Invalid user code: unbalanced braces");
        }

        return generatedCode;
    }

    private long countOccurrences(String str, char ch) {
        return str.chars().filter(c -> c == ch).count();
    }

    private String getJavaPrintStatement(String normalizedType) {
        if (normalizedType.equalsIgnoreCase("int_array") || normalizedType.equalsIgnoreCase("string_array") || normalizedType.endsWith("[]")) {
            return "if (result == null || result.length == 0) {\n" +
                   "    System.out.println(\"\");\n" +
                   "} else {\n" +
                   "    StringBuilder sb = new StringBuilder();\n" +
                   "    for (int i = 0; i < result.length; i++) {\n" +
                   "        if (i > 0) sb.append(\",\");\n" +
                   "        sb.append(result[i]);\n" +
                   "    }\n" +
                   "    System.out.println(sb.toString());\n" +
                   "}";
        } else if (normalizedType.equalsIgnoreCase("list<integer>") || normalizedType.equalsIgnoreCase("list<string>")) {
            return "if (result == null || result.size() == 0) {\n" +
                   "    System.out.println(\"\");\n" +
                   "} else {\n" +
                   "    StringBuilder sb = new StringBuilder();\n" +
                   "    for (int i = 0; i < result.size(); i++) {\n" +
                   "        if (i > 0) sb.append(\",\");\n" +
                   "        sb.append(result.get(i));\n" +
                   "    }\n" +
                   "    System.out.println(sb.toString());\n" +
                   "}";
        } else {
            return "System.out.println(result);";
        }
    }

    private String getJavaReturnType(String normalizedType) {
        switch (normalizedType.toLowerCase()) {
            case "int": return "int";
            case "string": return "String";
            case "boolean": return "boolean";
            case "int_array": return "int[]";
            case "string_array": return "String[]";
            case "list<integer>": return "List<Integer>";
            case "list<string>": return "List<String>";
            default:
                throw new IllegalArgumentException("Unsupported Java return type: " + normalizedType);
        }
    }

    private String generatePythonCode(Problem problem, String userCode, String parsedInputs) {
        String functionName = problem.getFunctionName();
        List<Parameter> parameters = problem.getParameters();
        String argsList = parameters.stream().map(Parameter::getName).collect(Collectors.joining(", "));

        return String.format(
            "import sys\n" +
            "import math\n" +
            "import json\n" +
            "from typing import List\n\n" +
            "%s\n\n" +
            "sol = Solution()\n" +
            "%s\n" +
            "result = sol.%s(%s)\n" +
            "print(json.dumps(result).replace(' ', ''))\n",
            userCode, parsedInputs, functionName, argsList
        );
    }

    private String generateCppCode(Problem problem, String userCode, String parsedInputs) {
        String functionName = problem.getFunctionName();
        String returnType = problem.getReturnType();
        List<Parameter> parameters = problem.getParameters();
        String argsList = parameters.stream().map(Parameter::getName).collect(Collectors.joining(", "));

        String printStatement;
        if (returnType.equalsIgnoreCase("int_array") || returnType.equalsIgnoreCase("string_array") || returnType.contains("vector")) {
            printStatement = "cout << \"[\";\n" +
                             "for(int i=0; i<result.size(); i++) {\n" +
                             "    if(i>0) cout << \",\";\n" +
                             "    cout << result[i];\n" +
                             "}\n" +
                             "cout << \"]\" << endl;";
        } else {
            printStatement = "cout << result << endl;";
        }

        return String.format(
            "#include <bits/stdc++.h>\n" +
            "using namespace std;\n\n" +
            "%s\n\n" +
            "int main() {\n" +
            "    Solution sol;\n" +
            "    %s\n" +
            "    auto result = sol.%s(%s);\n" +
            "    %s\n" +
            "    return 0;\n" +
            "}\n",
            userCode, parsedInputs.replace("\n", "\n    "), functionName, argsList, printStatement.replace("\n", "\n    ")
        );
    }
}
