package com.platform.judge;

import java.io.*;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/**
 * AbstractCodeExecutor
 *
 * Reliability fixes applied in this version:
 *
 *  1. isSuccess uses exitCode == 0 ONLY — stderr presence is irrelevant.
 *     A program that prints to stderr and still exits 0 is considered successful.
 *
 *  2. After destroyForcibly(), waitFor() is called with a short deadline to
 *     ensure the OS process is fully reaped before we return. This prevents
 *     zombie processes and resource leaks.
 *
 *  3. executionTime measures ONLY the run phase (startTime is set after process
 *     start, stopped at waitFor completion). Compile time is excluded.
 *
 *  4. Null/empty input is safely handled — stdin is closed (EOF sent) when
 *     no input is provided.
 */
public abstract class AbstractCodeExecutor implements CodeExecutor {

    /** Time allowed for the user program to run. JVM startup included. */
    private static final long RUN_TIMEOUT_SECONDS = 10;

    /**
     * Launch {@code pb}, inject stdin, capture stdout/stderr concurrently,
     * and return a structured {@link ExecutionResult}.
     *
     * Drain threads are started before waitFor() to prevent pipe-buffer deadlock.
     */
    protected ExecutionResult runProcess(ProcessBuilder pb) {
        try {
            Process process = pb.start();

            // ---- 1. Start drain threads BEFORE waitFor() -------------------------
            AtomicReference<String> stdoutRef = new AtomicReference<>("");
            AtomicReference<String> stderrRef = new AtomicReference<>("");

            Thread outThread = drainThread(process.getInputStream(), stdoutRef);
            Thread errThread = drainThread(process.getErrorStream(), stderrRef);
            outThread.start();
            errThread.start();

            // ---- 2. Close stdin immediately --------------------------------------
            process.getOutputStream().close();

            // ---- 3. Time only the run phase ------------------------------------
            long startTime = System.currentTimeMillis();
            boolean finished = process.waitFor(RUN_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            long executionTime = System.currentTimeMillis() - startTime;

            // ---- 4. Timeout handling -------------------------------------------
            if (!finished) {
                process.destroyForcibly();
                // Reap the process — ensures OS resources are released
                process.waitFor(3, TimeUnit.SECONDS);
                // Give drain threads a short window to capture partial output
                outThread.join(500);
                errThread.join(500);

                return ExecutionResult.builder()
                        .isTimeout(true)
                        .isSuccess(false)
                        .compilationError(false)
                        .exitCode(-1)
                        .executionTime(executionTime)
                        .output(stdoutRef.get())
                        .error("Time Limit Exceeded")
                        .build();
            }

            // ---- 5. Normal exit ------------------------------------------------
            outThread.join(2000);
            errThread.join(2000);

            int exitCode = process.exitValue();

            return ExecutionResult.builder()
                    .isTimeout(false)
                    .isSuccess(exitCode == 0)        // exit code only — no stderr heuristic
                    .compilationError(false)
                    .exitCode(exitCode)
                    .executionTime(executionTime)
                    .output(stdoutRef.get())
                    .error(stderrRef.get())
                    .build();

        } catch (Exception e) {
            return ExecutionResult.builder()
                    .isTimeout(false)
                    .isSuccess(false)
                    .compilationError(false)
                    .exitCode(-1)
                    .executionTime(0)
                    .output("")
                    .error(e.getMessage() != null ? e.getMessage() : e.getClass().getName())
                    .build();
        }
    }

    // ------------------------------------------------------------------ //
    //  Private helpers                                                     //
    // ------------------------------------------------------------------ //


    /** Create a daemon thread that drains {@code is} into {@code target}. */
    private Thread drainThread(InputStream is, AtomicReference<String> target) {
        Thread t = new Thread(() -> {
            try { target.set(readStream(is)); }
            catch (IOException ignored) {}
        });
        t.setDaemon(true);
        return t;
    }

    /** Read an InputStream fully into a String (line endings normalised to \n). */
    private String readStream(InputStream is) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append('\n');
            }
        }
        return sb.toString();
    }
}
