package com.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class ContestRequest {
    @NotBlank(message = "Title cannot be blank")
    private String title;

    @NotNull(message = "Start time cannot be null")
    private OffsetDateTime startTime;

    @NotNull(message = "End time cannot be null")
    private OffsetDateTime endTime;

    @NotNull(message = "CreatedBy user ID cannot be null")
    private Long createdBy;
}
