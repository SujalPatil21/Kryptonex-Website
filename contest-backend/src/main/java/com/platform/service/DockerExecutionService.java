package com.platform.service;

import com.platform.judge.ExecutionResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

@Slf4j
@Service
public class DockerExecutionService {

    private static final long COMPILE_TIMEOUT_SECONDS = 10;
    private static final long RUN_TIMEOUT_SECONDS = 6;
    private static final int MAX_OUTPUT_BYTES = 1_000_000;
    private static final String DOCKER_IMAGE_JAVA = "eclipse-temurin:17";
    private static final String DOCKER_IMAGE_PYTHON = "python:3.10";
    private static final String DOCKER_IMAGE_CPP = "gcc:latest";

    private final ExecutorService streamExecutor = Executors.newCachedThreadPool();

    @PostConstruct
    public void init() {
        // Non-blocking image pull
        CompletableFuture.runAsync(() -> {
            pullImage(DOCKER_IMAGE_JAVA);
            pullImage(DOCKER_IMAGE_PYTHON);
            pullImage(DOCKER_IMAGE_CPP);
        });
    }

    private void pullImage(String image) {
        try {
            log.info("Pulling Docker image: {}", image);
            new ProcessBuilder("docker", "pull", image).start().waitFor(5, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.warn("Failed to pre-pull image {}: {}", image, e.getMessage());
        }
    }

    public ExecutionResult execute(String code, String language) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("judge-" + UUID.randomUUID());
            String fileName = getFileName(language);
            Files.writeString(tempDir.resolve(fileName), code);

            String dockerPath = formatPathForDocker(tempDir.toAbsolutePath().toString());

            // 1. Compile Phase (if needed)
            if (needsCompilation(language)) {
                ExecutionResult compileResult = runInDocker(tempDir, dockerPath, getCompileCommand(language), language, true);
                if (!compileResult.isSuccess()) {
                    return compileResult;
                }
            }

            // 2. Run Phase
            return runInDocker(tempDir, dockerPath, getRunCommand(language), language, false);

        } catch (IOException e) {
            log.error("IO Error during execution setup", e);
            return ExecutionResult.builder()
                    .isSuccess(false)
                    .error("Internal Error: " + e.getMessage())
                    .build();
        } finally {
            cleanup(tempDir);
        }
    }

    private ExecutionResult runInDocker(Path hostPath, String dockerPath, String command, String language, boolean isCompile) {
        String image = getDockerImage(language);
        ProcessBuilder pb = new ProcessBuilder(
                "docker", "run", "--rm",
                "--memory=256m",
                "--cpus=0.5",
                "--pids-limit=64",
                "--network=none",
                "-v", dockerPath + ":/app",
                image,
                "bash", "-c", "cd /app && " + command
        );

        AtomicInteger totalBytes = new AtomicInteger(0);
        AtomicBoolean limitExceeded = new AtomicBoolean(false);
        ByteArrayOutputStream stdoutBaos = new ByteArrayOutputStream(isCompile ? 10240 : MAX_OUTPUT_BYTES);
        ByteArrayOutputStream stderrBaos = new ByteArrayOutputStream(isCompile ? 10240 : MAX_OUTPUT_BYTES);

        long startTime = System.currentTimeMillis();
        Process process = null;
        try {
            process = pb.start();
            final Process procRef = process;

            Future<?> stdoutFuture = streamExecutor.submit(() -> 
                readStream(procRef.getInputStream(), stdoutBaos, totalBytes, limitExceeded, procRef));
            Future<?> stderrFuture = streamExecutor.submit(() -> 
                readStream(procRef.getErrorStream(), stderrBaos, totalBytes, limitExceeded, procRef));

            long timeout = isCompile ? COMPILE_TIMEOUT_SECONDS : RUN_TIMEOUT_SECONDS;
            boolean finished = process.waitFor(timeout, TimeUnit.SECONDS);
            long executionTime = System.currentTimeMillis() - startTime;

            if (!finished) {
                if (process.isAlive()) process.destroyForcibly();
                // Wait for readers to finish after destruction
                stdoutFuture.get(1, TimeUnit.SECONDS);
                stderrFuture.get(1, TimeUnit.SECONDS);

                return ExecutionResult.builder()
                        .isTimeout(true)
                        .isSuccess(false)
                        .executionTime(executionTime)
                        .error("Time Limit Exceeded")
                        .build();
            }

            // Ensure readers are joined
            stdoutFuture.get(2, TimeUnit.SECONDS);
            stderrFuture.get(2, TimeUnit.SECONDS);

            int exitCode = process.exitValue();
            String stdout = stdoutBaos.toString(StandardCharsets.UTF_8);
            String stderr = stderrBaos.toString(StandardCharsets.UTF_8);

            if (isCompile) {
                return ExecutionResult.builder()
                        .isSuccess(exitCode == 0)
                        .compilationError(exitCode != 0)
                        .error(stderr)
                        .output(stdout)
                        .exitCode(exitCode)
                        .build();
            } else {
                boolean exceeded = limitExceeded.get();
                boolean isTimeout = (exitCode == 124);
                boolean isRuntimeError = (exitCode != 0 && !isTimeout && !exceeded);

                return ExecutionResult.builder()
                        .isSuccess(exitCode == 0 && !exceeded)
                        .isTimeout(isTimeout)
                        .isRuntimeError(isRuntimeError)
                        .outputLimitExceeded(exceeded)
                        .executionTime(executionTime)
                        .output(stdout)
                        .error(stderr)
                        .exitCode(exitCode)
                        .build();
            }

        } catch (Exception e) {
            log.error("Execution error in Docker", e);
            if (process != null && process.isAlive()) process.destroyForcibly();
            return ExecutionResult.builder()
                    .isSuccess(false)
                    .error("Execution Error: " + e.getMessage())
                    .build();
        }
    }

    private void readStream(InputStream is, ByteArrayOutputStream baos, AtomicInteger totalBytes, AtomicBoolean limitExceeded, Process process) {
        byte[] buffer = new byte[4096];
        int bytesRead;
        try {
            while (!limitExceeded.get() && (bytesRead = is.read(buffer)) != -1) {
                if (limitExceeded.get()) return;

                while (true) {
                    int current = totalBytes.get();
                    int remaining = MAX_OUTPUT_BYTES - current;

                    if (remaining <= 0) {
                        signalOverflow(limitExceeded, process);
                        return;
                    }

                    int toWrite = Math.min(bytesRead, remaining);
                    if (totalBytes.compareAndSet(current, current + toWrite)) {
                        baos.write(buffer, 0, toWrite);
                        if (toWrite < bytesRead) {
                            signalOverflow(limitExceeded, process);
                            return;
                        }
                        break; // CAS loop success
                    }
                    // CAS failed, retry
                }
            }
        } catch (IOException e) {
            // Stream closed or error, exit thread
        } finally {
            try { is.close(); } catch (IOException ignored) {}
        }
    }

    private void signalOverflow(AtomicBoolean limitExceeded, Process process) {
        if (limitExceeded.compareAndSet(false, true)) {
            if (process.isAlive()) {
                process.destroyForcibly();
            }
        }
    }

    private String formatPathForDocker(String path) {
        String p = path.replace("\\", "/");
        if (p.length() > 1 && p.charAt(1) == ':') {
            char drive = Character.toLowerCase(p.charAt(0));
            p = "/" + drive + p.substring(2);
        }
        return p;
    }

    private String getFileName(String language) {
        return switch (language.toLowerCase()) {
            case "java" -> "Main.java";
            case "python" -> "main.py";
            case "cpp" -> "main.cpp";
            default -> "main";
        };
    }

    private boolean needsCompilation(String language) {
        return "java".equalsIgnoreCase(language) || "cpp".equalsIgnoreCase(language);
    }

    private String getCompileCommand(String language) {
        return switch (language.toLowerCase()) {
            case "java" -> "javac Main.java";
            case "cpp" -> "g++ main.cpp -o main";
            default -> "";
        };
    }

    private String getRunCommand(String language) {
        return switch (language.toLowerCase()) {
            case "java" -> "timeout 5 java Main";
            case "python" -> "timeout 5 python main.py";
            case "cpp" -> "timeout 5 ./main";
            default -> "echo Unknown language";
        };
    }

    private String getDockerImage(String language) {
        return switch (language.toLowerCase()) {
            case "java" -> DOCKER_IMAGE_JAVA;
            case "python" -> DOCKER_IMAGE_PYTHON;
            case "cpp" -> DOCKER_IMAGE_CPP;
            default -> "alpine";
        };
    }

    private void cleanup(Path path) {
        if (path == null) return;
        try (Stream<Path> walk = Files.walk(path)) {
            walk.sorted((p1, p2) -> p2.compareTo(p1))
                .map(Path::toFile)
                .forEach(File::delete);
        } catch (IOException e) {
            log.warn("Failed to cleanup temp dir {}: {}", path, e.getMessage());
        }
    }
}
