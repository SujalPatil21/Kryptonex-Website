package com.platform.service;

import com.platform.entity.Problem;
import com.platform.entity.TestCase;
import com.platform.entity.enums.SubmissionStatus;
import com.platform.judge.ExecutionResult;
import com.platform.judge.generator.CodeGenerator;
import com.platform.judge.parser.InputParser;
import com.platform.judge.parser.JudgeComparator;
import com.platform.judge.parser.OutputNormalizer;
import lombok.Builder;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CodeExecutionService {

    private final DockerExecutionService dockerExecutionService;
    private final InputParser inputParser;
    private final CodeGenerator codeGenerator;
    private final OutputNormalizer outputNormalizer;
    private final JudgeComparator judgeComparator;

    public CodeExecutionService(DockerExecutionService dockerExecutionService,
                                InputParser inputParser,
                                CodeGenerator codeGenerator,
                                OutputNormalizer outputNormalizer,
                                JudgeComparator judgeComparator) {
        this.dockerExecutionService = dockerExecutionService;
        this.inputParser = inputParser;
        this.codeGenerator = codeGenerator;
        this.outputNormalizer = outputNormalizer;
        this.judgeComparator = judgeComparator;
    }

    @Data
    @Builder
    public static class EvaluationResult {
        private SubmissionStatus status;
        private int passedCount;
        private int totalCount;
        private int failedTestcaseIndex;
        private long totalExecutionTime;
        private String verdictMessage;
        private String errorDetail;
    }

    public EvaluationResult evaluate(Problem problem, String code, String language) {

        List<TestCase> testCases = problem.getTestCases();
        if (testCases == null || testCases.isEmpty()) {
            return EvaluationResult.builder()
                    .status(SubmissionStatus.ERROR)
                    .verdictMessage("No test cases configured for this problem")
                    .passedCount(0)
                    .totalCount(0)
                    .failedTestcaseIndex(-1)
                    .totalExecutionTime(0)
                    .build();
        }

        long totalTime = 0;
        int passed = 0;
        int total = testCases.size();

        for (int i = 0; i < total; i++) {
            TestCase tc = testCases.get(i);
            int caseNumber = i + 1;

            try {
                // 1. Generate code for the specific test case
                String parsedInputs = inputParser.parseInput(tc.getInputJson(), problem.getParameters(), language);
                String generatedCode = codeGenerator.generateCode(problem, code, parsedInputs, language);

                // 2. Execute
                ExecutionResult result = dockerExecutionService.execute(generatedCode, language);
                totalTime += result.getExecutionTime();

                // 3. Strict Verdict Priority
                if (result.isCompilationError()) {
                    return EvaluationResult.builder()
                            .status(SubmissionStatus.COMPILATION_ERROR)
                            .verdictMessage("Compilation Error")
                            .errorDetail(nullToEmpty(result.getError()))
                            .passedCount(0)
                            .totalCount(total)
                            .failedTestcaseIndex(caseNumber)
                            .totalExecutionTime(totalTime)
                            .build();
                }

                if (result.isOutputLimitExceeded()) {
                    return EvaluationResult.builder()
                            .status(SubmissionStatus.RUNTIME_ERROR)
                            .verdictMessage("Output Limit Exceeded on test case " + caseNumber)
                            .passedCount(passed)
                            .totalCount(total)
                            .failedTestcaseIndex(caseNumber)
                            .totalExecutionTime(totalTime)
                            .build();
                }

                if (result.isTimeout()) {
                    return EvaluationResult.builder()
                            .status(SubmissionStatus.TIME_LIMIT_EXCEEDED)
                            .verdictMessage("Time Limit Exceeded on test case " + caseNumber)
                            .passedCount(passed)
                            .totalCount(total)
                            .failedTestcaseIndex(caseNumber)
                            .totalExecutionTime(totalTime)
                            .build();
                }

                if (result.isRuntimeError()) {
                    return EvaluationResult.builder()
                            .status(SubmissionStatus.RUNTIME_ERROR)
                            .verdictMessage("Runtime Error on test case " + caseNumber + " (exit code " + result.getExitCode() + ")")
                            .errorDetail(nullToEmpty(result.getError()))
                            .passedCount(passed)
                            .totalCount(total)
                            .failedTestcaseIndex(caseNumber)
                            .totalExecutionTime(totalTime)
                            .build();
                }

                // 4. Output Preparation & Normalization
                String actualRaw = result.getOutput() == null ? "" : result.getOutput();
                String expectedRaw = tc.getExpectedOutputJson() == null ? "" : tc.getExpectedOutputJson().toString();

                String actual = normalize(actualRaw);
                String expected = normalize(expectedRaw);

                // 5. Comparison
                if (!actual.equals(expected)) {
                    return EvaluationResult.builder()
                            .status(SubmissionStatus.WRONG_ANSWER)
                            .verdictMessage("Wrong Answer on test case " + caseNumber +
                                    "\nExpected: " + expected +
                                    "\nActual: " + actual)
                            .passedCount(passed)
                            .totalCount(total)
                            .failedTestcaseIndex(caseNumber)
                            .totalExecutionTime(totalTime)
                            .build();
                }

                passed++;

            } catch (Exception e) {
                 return EvaluationResult.builder()
                        .status(SubmissionStatus.ERROR)
                        .verdictMessage("Internal Judge Error on test case " + caseNumber + ": " + e.getMessage())
                        .passedCount(passed)
                        .totalCount(total)
                        .failedTestcaseIndex(caseNumber)
                        .totalExecutionTime(totalTime)
                        .build();
            }
        }

        return EvaluationResult.builder()
                .status(SubmissionStatus.ACCEPTED)
                .verdictMessage("All " + total + " test case(s) passed")
                .passedCount(passed)
                .totalCount(total)
                .failedTestcaseIndex(-1)
                .totalExecutionTime(totalTime)
                .build();
    }

    private String normalize(String s) {
        if (s == null) return "";
        // 1. Full Line Ending Normalization
        s = s.replace("\r\n", "\n").replace("\r", "\n");
        // 2. Trim BEFORE processing
        s = s.trim();
        if (s.isEmpty()) return "";

        // 3. Line Processing & Ignore Empty Lines
        return Arrays.stream(s.split("\\R"))
                .map(line -> line.trim().replaceAll("\\s+", " "))
                .filter(line -> !line.isEmpty())
                .collect(Collectors.joining("\n"));
    }

    private String nullToEmpty(String s) {
        return s == null ? "" : s;
    }
}
