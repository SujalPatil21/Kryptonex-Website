package com.platform.entity.enums;

public enum SubmissionStatus {
    ACCEPTED,
    WRONG_ANSWER,
    TIME_LIMIT_EXCEEDED,
    RUNTIME_ERROR,
    COMPILATION_ERROR,
    ERROR          // generic fallback (unsupported language, system fault, etc.)
}
