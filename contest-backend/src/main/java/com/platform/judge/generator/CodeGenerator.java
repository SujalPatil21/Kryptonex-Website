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
        String functionName = problem.getFunctionName();
        String returnType = problem.getReturnType();
        List<Parameter> parameters = problem.getParameters();

        String argsList = parameters.stream().map(Parameter::getName).collect(Collectors.joining(", "));

        String printStatement;
        if (returnType.equalsIgnoreCase("int_array") || returnType.equalsIgnoreCase("string_array") || returnType.contains("[")) {
            printStatement = "System.out.println(Arrays.toString(result).replaceAll(\" \", \"\"));";
        } else {
            printStatement = "System.out.println(result);";
        }

        return String.format(
            "import java.util.*;\n" +
            "import java.io.*;\n\n" +
            "%s\n\n" +
            "public class Main {\n" +
            "    public static void main(String[] args) {\n" +
            "        Solution sol = new Solution();\n" +
            "        %s\n" +
            "        %s result = sol.%s(%s);\n" +
            "        %s\n" +
            "    }\n" +
            "}\n",
            userCode, parsedInputs.replace("\n", "\n        "), getJavaReturnType(returnType), functionName, argsList, printStatement
        );
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

    private String getJavaReturnType(String returnType) {
        switch (returnType.toLowerCase()) {
            case "int": return "int";
            case "string": return "String";
            case "int_array": return "int[]";
            case "string_array": return "String[]";
            default: return returnType;
        }
    }
}
