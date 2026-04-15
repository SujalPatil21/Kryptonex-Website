package com.platform.judge;

public interface CodeExecutor {
    ExecutionResult execute(String code);
    String getSupportedLanguage();
}
