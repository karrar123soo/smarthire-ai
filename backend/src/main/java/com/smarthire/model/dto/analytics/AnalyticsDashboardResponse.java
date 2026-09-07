package com.smarthire.model.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDashboardResponse {
    private long totalJobs;
    private long openJobs;
    private long totalCandidates;
    private long totalApplications;
    private long totalInterviews;
    private double overallAverageMatchScore;
    
    private RecruitmentFunnelDto funnel;
    private List<SkillDemandDto> topInDemandSkills;
    private Map<String, Long> applicationsByDepartment;
    private Map<String, Long> matchScoreDistribution; // e.g. "90-100%": 4, "75-89%": 8
    private double averageTimeToInterviewDays;
}
