package com.smarthire.model.dto.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PipelineStatsResponse {
    private long totalApplications;
    private long appliedCount;
    private long underReviewCount;
    private long shortlistedCount;
    private long interviewScheduledCount;
    private long rejectedCount;
    private long hiredCount;
    private double averageMatchScore;
}
