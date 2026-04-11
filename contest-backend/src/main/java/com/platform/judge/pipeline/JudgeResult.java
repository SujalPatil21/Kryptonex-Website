package com.platform.judge.pipeline;

/**
 * JudgeResult
 *
 * Immutable value object returned by {@link JudgePipeline} after a single
 * test-case run.
 *
 * @param status          High-level verdict for this run.
 * @param actualOutput    The raw stdout captured from the executed program
 *                        (trimmed).
 * @param expectedOutput  The expected output string from the test case.
 * @param errorMessage    Compiler or runtime error details, or {@code null}
 *                        when status is {@link Status#ACCEPTED}.
 * @param executionMillis Wall-clock time from process start to exit, in ms.
 */
public record JudgeResult(
        Status status,
        String actualOutput,
        String expectedOutput,
        String errorMessage,
        long   executionMillis
) {
    /** Verdict categories returned by the pipeline. */
    public enum Status {
        ACCEPTED,
        WRONG_ANSWER,
        COMPILATION_ERROR,
        RUNTIME_ERROR,
        TIME_LIMIT_EXCEEDED,
        OUTPUT_LIMIT_EXCEEDED
    }
    public static JudgeResult outputLimitExceeded(long ms) {
        return new JudgeResult(
                Status.OUTPUT_LIMIT_EXCEEDED,
                "",
                "",
                "Output Limit Exceeded",
                ms
        );
    }

    // ------------------------------------------------------------------ //
    //  Convenience factories                                              //
    // ------------------------------------------------------------------ //

    public static JudgeResult accepted(String actual, String expected, long ms) {
        return new JudgeResult(Status.ACCEPTED, actual, expected, null, ms);
    }

    public static JudgeResult wrongAnswer(String actual, String expected, long ms) {
        return new JudgeResult(Status.WRONG_ANSWER, actual, expected, null, ms);
    }

    public static JudgeResult compilationError(String error) {
        return new JudgeResult(Status.COMPILATION_ERROR, "", "", error, 0);
    }

    public static JudgeResult runtimeError(String error, long ms) {
        return new JudgeResult(Status.RUNTIME_ERROR, "", "", error, ms);
    }

    public static JudgeResult timeLimitExceeded(long ms) {
        return new JudgeResult(Status.TIME_LIMIT_EXCEEDED, "", "", "Time Limit Exceeded", ms);
    }

    /** @return {@code true} iff status is {@link Status#ACCEPTED}. */
    public boolean isPassed() {
        return status == Status.ACCEPTED;
    }
}
