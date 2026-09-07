package com.smarthire.model.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecruitmentFunnelDto {
    private long totalApplied;
    private long underReview;
    private long shortlisted;
    private long interviewScheduled;
    private long hired;
    private long rejected;
    
    // Percentage conversion relative to total applied
    private double reviewConversionRate;
    private double shortlistConversionRate;
    private double interviewConversionRate;
    private double hireConversionRate;
}
