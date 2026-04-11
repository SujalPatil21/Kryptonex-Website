package com.platform.dto;

import com.platform.entity.enums.SubmissionStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SubmissionResponse {
    private Long id;
    private Long userId;
    private Long problemId;
    private Long contestId;
    private String language;
    private SubmissionStatus status;
    private String verdictMessage;
    private int score;
    private long executionTime;
    private LocalDateTime submittedAt;
}
