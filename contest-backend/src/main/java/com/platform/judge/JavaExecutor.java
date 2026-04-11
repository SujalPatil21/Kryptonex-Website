package com.platform.judge;

import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.*;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/**
 * JavaExecutor
 *
 * Reliability fixes applied in this version:
 *
 *  1. Compilation failure detection uses exit code ONLY (javac returns non-zero
 *     on error). The COMPILATION_ERROR: string prefix hack is removed.
 *     compilationError flag is set directly in ExecutionResult.
 *
 *  2. compilationError = true is returned immediately without setting isSuccess.
 *     CodeExecutionService reads result.isCompilationError() — no string parsing.
 *
 *  3. Timeout teardown: destroyForcibly() is followed by waitFor() to fully
 *     reap the process before returning (prevents zombie processes).
 *
 *  4. Execution time: measured from process.start() to waitFor() completion,
 *     EXCLUDING compilation time.
 *
 *  5. Null/empty input is safely handled.
 *
 *  6. Cleanup uses reversed path ordering (deepest first) so files are deleted
 *     before their parent directories.
 */
@Component
public class JavaExecutor extends AbstractCodeExecutor {

    private static final long COMPILE_TIMEOUT_SECONDS = 15;

    @Override
    public String getSupportedLanguage() {
        return "Java";
    }

    @Override
    public ExecutionResult execute(String code, String input) {
        // Input validation
        if (code == null || code.isBlank()) {
            return ExecutionResult.builder()
                    .isSuccess(false)
                    .isTimeout(false)
                    .compilationError(false)
                    .exitCode(-1)
                    .output("")
                    .error("Submitted code is null or empty")
                    .executionTime(0)
                    .build();
        }

        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("judge_java_");
            Files.writeString(tempDir.resolve("Main.java"), code);

            // ---------- COMPILE ----------
            CompileResult compileResult = compile(tempDir);

            if (!compileResult.success) {
                // Return compilation failure via the compilationError flag — no string prefix
                return ExecutionResult.builder()
                        .isSuccess(false)
                        .isTimeout(false)
                        .compilationError(true)          // ← clean boolean signal
                        .exitCode(compileResult.exitCode)
                        .output("")
                        .error(compileResult.stderr)
                        .executionTime(0)                // compilation time not counted
                        .build();
            }

            // ---------- RUN (timing starts inside AbstractCodeExecutor.runProcess) ----------
            ProcessBuilder runPb = new ProcessBuilder("java", "Main");
            runPb.directory(tempDir.toFile());
            return runProcess(runPb, input);

        } catch (Exception e) {
            return ExecutionResult.builder()
                    .isSuccess(false)
                    .isTimeout(false)
                    .compilationError(false)
                    .exitCode(-1)
                    .output("")
                    .error(e.getMessage() != null ? e.getMessage() : e.getClass().getName())
                    .executionTime(0)
                    .build();
        } finally {
            cleanup(tempDir);
        }
    }

    // ------------------------------------------------------------------ //
    //  Compile helper                                                      //
    // ------------------------------------------------------------------ //

    private record CompileResult(boolean success, int exitCode, String stderr) {}

    /**
     * Run {@code javac Main.java} inside {@code workDir}.
     * Drains stdout+stderr concurrently to prevent pipe-buffer deadlock.
     * Uses exit code ONLY to determine success — no stderr string checks.
     */
    private CompileResult compile(Path workDir) throws Exception {
        ProcessBuilder pb = new ProcessBuilder("javac", "Main.java");
        pb.directory(workDir.toFile());

        Process process = pb.start();

        AtomicReference<String> stdoutRef = new AtomicReference<>("");
        AtomicReference<String> stderrRef = new AtomicReference<>("");

        Thread outThread = drainThread(process.getInputStream(), stdoutRef);
        Thread errThread = drainThread(process.getErrorStream(), stderrRef);
        outThread.start();
        errThread.start();

        // javac never reads stdin; close it immediately (send EOF)
        process.getOutputStream().close();

        boolean finished = process.waitFor(COMPILE_TIMEOUT_SECONDS, TimeUnit.SECONDS);

        if (!finished) {
            process.destroyForcibly();
            process.waitFor(3, TimeUnit.SECONDS); // reap
            outThread.join(500);
            errThread.join(500);
            return new CompileResult(false, -1,
                    "Compilation timed out after " + COMPILE_TIMEOUT_SECONDS + " seconds");
        }

        outThread.join(2000);
        errThread.join(2000);

        int exitCode = process.exitValue();
        // Success is determined solely by exit code
        boolean success = (exitCode == 0);
        return new CompileResult(success, exitCode, stderrRef.get());
    }

    // ------------------------------------------------------------------ //
    //  Stream and cleanup utilities                                        //
    // ------------------------------------------------------------------ //

    private Thread drainThread(InputStream is, AtomicReference<String> target) {
        Thread t = new Thread(() -> {
            try { target.set(readStreamFully(is)); }
            catch (IOException ignored) {}
        });
        t.setDaemon(true);
        return t;
    }

    private String readStreamFully(InputStream is) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append('\n');
            }
        }
        return sb.toString();
    }

    /** Delete temp directory — deepest paths first so dirs are empty before removal. */
    private void cleanup(Path dir) {
        if (dir == null) return;
        try {
            Files.walk(dir)
                    .sorted((a, b) -> b.compareTo(a))
                    .map(Path::toFile)
                    .forEach(File::delete);
        } catch (IOException ignored) {}
    }
}
