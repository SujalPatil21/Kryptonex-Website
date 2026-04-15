package com.platform.judge;

import lombok.Builder;
import lombok.Data;

/**
 * ExecutionResult
 *
 * Structured result returned by every CodeExecutor implementation.
 *
 * Changes vs original:
 *  - Added exitCode:          raw OS process exit code — the single source of
 *                             truth for success/failure (replaces stderr-presence heuristic).
 *  - Added compilationError:  set by JavaExecutor when javac exits non-zero,
 *                             so CodeExecutionService never needs string parsing.
 *  - isSuccess:               now purely exitCode == 0; stderr content is irrelevant.
 */
@Data
@Builder
public class ExecutionResult {

    /** Raw stdout captured from the program. Never null — empty string if none. */
    private String output;

    /** Raw stderr captured from the program. Never null — empty string if none. */
    private String error;

    /** Wall-clock milliseconds of the RUN phase only (excludes compilation). */
    private long executionTime;

    /** True when the process was killed for exceeding the time limit. */
    private boolean isTimeout;

    /**
     * True when the process exited with code 0 AND isTimeout is false.
     * Determined purely by exit code — NOT by stderr content.
     */
    private boolean isSuccess;

    /**
     * True when javac itself failed (exit code != 0 during compilation).
     * Set explicitly by the executor — CodeExecutionService reads this flag
     * instead of inspecting error message strings.
     */
    private boolean compilationError;

    /**
     * The OS-level exit code of the executed process.
     * -1 indicates the process was destroyed (timeout) before it could exit.
     */
    private int exitCode;

    /**
     * True when the process exited with code != 0 during the run phase,
     * and it was not a timeout.
     */
    private boolean isRuntimeError;

    private boolean outputLimitExceeded;

    public boolean isOutputLimitExceeded() {
        return outputLimitExceeded;
    }
}
