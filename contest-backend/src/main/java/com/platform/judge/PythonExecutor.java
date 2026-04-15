package com.platform.judge;

import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
public class PythonExecutor extends AbstractCodeExecutor {

    @Override
    public String getSupportedLanguage() {
        return "Python";
    }

    @Override
    public ExecutionResult execute(String code) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("judge_python_");
            File sourceFile = tempDir.resolve("temp.py").toFile();
            Files.writeString(sourceFile.toPath(), code);

            ProcessBuilder pb = new ProcessBuilder("python", "temp.py");
            pb.directory(tempDir.toFile());

            return runProcess(pb);

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
