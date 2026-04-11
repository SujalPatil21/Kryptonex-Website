package com.platform.service;

import com.platform.entity.TestCase;
import com.platform.entity.enums.SubmissionStatus;
import com.platform.judge.CodeExecutor;
import com.platform.judge.ExecutionResult;
import lombok.Builder;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * CodeExecutionService
 *
 * Orchestrates multi-testcase evaluation.
 *
 * Reliability fixes applied in this version:
 *
 *  1. CE detection uses result.isCompilationError() — a boolean flag set by
 *     the executor based on javac's exit code. No string parsing at all.
 *
 *  2. RE detection uses !result.isSuccess() combined with !result.isTimeout()
 *     and !result.isCompilationError(). isSuccess itself is purely exitCode == 0.
 *
 *  3. TLE detection uses result.isTimeout() — set when the process was
 *     destroyForcibly()'d after exceeding RUN_TIMEOUT_SECONDS.
 *
 *  4. EvaluationResult now includes failedTestcaseIndex (1-based, -1 = none)
 *     so callers can pinpoint exactly which test case caused a failure.
 *
 *  5. normalize() handles \r\n / \r line endings and trims per-line trailing
 *     whitespace to prevent false WRONG_ANSWER on platform differences.
 *
 *  6. Null + empty test case list are safely guarded.
 */
@Service
public class CodeExecutionService {

    private final Map<String, CodeExecutor> executors;

    public CodeExecutionService(List<CodeExecutor> executorList) {
        this.executors = executorList.stream()
                .collect(Collectors.toMap(
                        CodeExecutor::getSupportedLanguage,
                        Function.identity()
                ));
    }

    // ------------------------------------------------------------------ //
    //  Result DTO                                                          //
    // ------------------------------------------------------------------ //

    @Data
    @Builder
    public static class EvaluationResult {
        private SubmissionStatus status;
        /** Number of test cases that produced the correct output. */
        private int passedCount;
        /** Total number of test cases evaluated. */
        private int totalCount;
        /**
         * 1-based index of the first test case that failed.
         * -1 when all test cases passed (ACCEPTED).
         */
        private int failedTestcaseIndex;
        /** Sum of execution times across all test cases (ms). */
        private long totalExecutionTime;
        /** Human-readable verdict message. */
        private String verdictMessage;
        /** Raw compiler output or runtime stderr for debugging. */
        private String errorDetail;
    }

    // ------------------------------------------------------------------ //
    //  Evaluate                                                            //
    // ------------------------------------------------------------------ //

    public EvaluationResult evaluate(String code, String language, List<TestCase> testCases) {

        // ---- 1. Resolve executor -----------------------------------------
        CodeExecutor executor = executors.get(language);
        if (executor == null) {
            return EvaluationResult.builder()
                    .status(SubmissionStatus.ERROR)
                    .verdictMessage("Unsupported language: " + language)
                    .passedCount(0)
                    .totalCount(testCases == null ? 0 : testCases.size())
                    .failedTestcaseIndex(-1)
                    .totalExecutionTime(0)
                    .build();
        }

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

        // ---- 2. Run each test case sequentially -------------------------
        long totalTime = 0;
        int  passed    = 0;
        int  total     = testCases.size();

        for (int i = 0; i < total; i++) {
            TestCase tc         = testCases.get(i);
            int      caseNumber = i + 1;            // 1-based for user messages

            ExecutionResult result = executor.execute(code, tc.getInput());
            totalTime += result.getExecutionTime();

            // ---- Compilation Error (checked first — same result for all TCs) ----
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

            // ---- Time Limit Exceeded ----------------------------------------
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

            // ---- Runtime Error — exit code != 0 (not a timeout, not CE) --------
            if (!result.isSuccess()) {
                return EvaluationResult.builder()
                        .status(SubmissionStatus.RUNTIME_ERROR)
                        .verdictMessage("Runtime Error on test case " + caseNumber
                                + " (exit code " + result.getExitCode() + ")")
                        .errorDetail(nullToEmpty(result.getError()))
                        .passedCount(passed)
                        .totalCount(total)
                        .failedTestcaseIndex(caseNumber)
                        .totalExecutionTime(totalTime)
                        .build();
            }

            // ---- Wrong Answer -----------------------------------------------
            String actual   = normalize(result.getOutput());
            String expected = normalize(tc.getOutput());

            if (!actual.equals(expected)) {
                return EvaluationResult.builder()
                        .status(SubmissionStatus.WRONG_ANSWER)
                        .verdictMessage("Wrong Answer on test case " + caseNumber)
                        .passedCount(passed)
                        .totalCount(total)
                        .failedTestcaseIndex(caseNumber)
                        .totalExecutionTime(totalTime)
                        .build();
            }

            passed++;
        }

        // ---- 3. All passed -----------------------------------------------
        return EvaluationResult.builder()
                .status(SubmissionStatus.ACCEPTED)
                .verdictMessage("All " + total + " test case(s) passed")
                .passedCount(passed)
                .totalCount(total)
                .failedTestcaseIndex(-1)
                .totalExecutionTime(totalTime)
                .build();
    }

    // ------------------------------------------------------------------ //
    //  Private helpers                                                     //
    // ------------------------------------------------------------------ //

    /**
     * Normalize output before comparison:
     *  - Unify line endings (\r\n → \n, \r → \n).
     *  - Strip trailing whitespace from each individual line.
     *  - Strip leading/trailing blank lines from the whole result.
     *
     * This prevents false WRONG_ANSWERs caused solely by platform
     * line-ending differences or trailing spaces in expected output.
     */
    private String normalize(String raw) {
        if (raw == null) return "";
        return raw.replace("\r\n", "\n")
                  .replace("\r", "\n")
                  .lines()
                  .map(String::stripTrailing)
                  .collect(Collectors.joining("\n"))
                  .strip();
    }

    private String nullToEmpty(String s) {
        return s == null ? "" : s;
    }
}
