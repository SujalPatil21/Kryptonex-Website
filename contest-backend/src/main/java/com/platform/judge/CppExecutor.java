package com.platform.judge;

import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
public class CppExecutor extends AbstractCodeExecutor {

    @Override
    public String getSupportedLanguage() {
        return "C++";
    }

    @Override
    public ExecutionResult execute(String code) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("judge_cpp_");
            File sourceFile = tempDir.resolve("temp.cpp").toFile();
            Files.writeString(sourceFile.toPath(), code);

            boolean isWin = System.getProperty("os.name").toLowerCase().contains("win");
            String exeName = isWin ? "temp.exe" : "temp";

            // Compile
            ProcessBuilder compilePb = new ProcessBuilder("g++", "temp.cpp", "-o", exeName);
            compilePb.directory(tempDir.toFile());
            Process compileProcess = compilePb.start();
            boolean compileFinished = compileProcess.waitFor(5, java.util.concurrent.TimeUnit.SECONDS);

            if (!compileFinished || compileProcess.exitValue() != 0) {
                if (!compileFinished) compileProcess.destroyForcibly();
                return ExecutionResult.builder()
                        .isSuccess(false)
                        .error("Compilation Error")
                        .output("")
                        .build();
            }

            // Run
            String runCmd = isWin ? exeName : "./" + exeName;
            ProcessBuilder runPb = new ProcessBuilder(runCmd);
            runPb.directory(tempDir.toFile());

            return runProcess(runPb);

        } catch (Exception e) {
            return ExecutionResult.builder()
                    .isSuccess(false)
                    .error(e.getMessage())
                    .output("")
                    .build();
        } finally {
            cleanup(tempDir);
        }
    }

    private void cleanup(Path tempDir) {
        if (tempDir != null) {
            try {
                Files.walk(tempDir)
                        .map(Path::toFile)
                        .forEach(File::delete);
            } catch (Exception ignored) {
            }
        }
    }
}
