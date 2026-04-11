package com.platform.judge.pipeline;

import com.platform.judge.JavaExecutor;
import com.platform.judge.ExecutionResult;
import com.platform.judge.generator.JavaCodeGenerator;
import com.platform.judge.parser.InputParser;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.StringJoiner;

@Component
public class JudgePipeline {

    private final InputParser        inputParser;
    private final JavaCodeGenerator  codeGenerator;
    private final JavaExecutor       executor;

    public JudgePipeline(
            InputParser       inputParser,
            JavaCodeGenerator codeGenerator,
            JavaExecutor executor
    ) {
        this.inputParser   = inputParser;
        this.codeGenerator = codeGenerator;
        this.executor      = executor;
    }

    public JudgeResult run(JudgeRequest request) {
        long start = System.currentTimeMillis();

        // ---- Stage 1: Parse inputs ----
        String functionCallBlock = buildFunctionCallBlock(request);

        // ---- Stage 2: Generate code ----
        String fullCode = codeGenerator.generate(request.userCode(), functionCallBlock);

        // ---- Stage 3: Execute ----
        ExecutionResult result = executor.execute(fullCode, "");

        long elapsed = System.currentTimeMillis() - start;

        // ---- Handle execution result ----
        if (result.isCompilationError()) {
            return JudgeResult.compilationError(result.getError());
        }

        if (result.isTimeout()) {
            return JudgeResult.timeLimitExceeded(elapsed);
        }

        if (result.isOutputLimitExceeded()) {
            return JudgeResult.outputLimitExceeded(elapsed);
        }

        if (!result.isSuccess()) {
            return JudgeResult.runtimeError(result.getError(), elapsed);
        }

        String actual   = result.getOutput().trim();
        String expected = request.expectedOutput() != null ? request.expectedOutput().trim() : "";

        if (actual.equals(expected)) {
            return JudgeResult.accepted(actual, expected, elapsed);
        } else {
            return JudgeResult.wrongAnswer(actual, expected, elapsed);
        }
    }

    private String buildFunctionCallBlock(JudgeRequest request) {
        List<String> types  = request.paramTypes();
        List<String> values = request.paramValues();
        String returnType   = request.returnType();
        String method       = request.methodName();

        StringBuilder sb = new StringBuilder();

        StringJoiner argNames = new StringJoiner(", ");
        for (int i = 0; i < types.size(); i++) {
            String type    = types.get(i);
            String parsed  = inputParser.parse(type, values.get(i));
            String argName = "arg" + i;
            sb.append(type).append(' ').append(argName)
                    .append(" = ").append(parsed).append(";\n");
            argNames.add(argName);
        }

        if ("void".equals(returnType)) {
            sb.append("sol.").append(method).append('(').append(argNames).append(");\n");
        } else {
            sb.append(returnType).append(" result = sol.")
                    .append(method).append('(').append(argNames).append(");\n");
            sb.append("System.out.println(")
                    .append(printExpression(returnType, "result"))
                    .append(");\n");
        }

        return sb.toString();
    }

    private String printExpression(String returnType, String varName) {
        if (returnType.endsWith("[][]")) {
            return "java.util.Arrays.deepToString(" + varName + ")";
        }
        if (returnType.endsWith("[]")) {
            return "java.util.Arrays.toString(" + varName + ")";
        }
        return varName;
    }
}