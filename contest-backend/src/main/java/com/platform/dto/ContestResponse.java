package com.platform.dto;

import com.platform.entity.enums.ContestStatus;
import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Builder
public class ContestResponse {
    private Long id;
    private String title;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private ContestStatus status;
    private String createdBy;
}
