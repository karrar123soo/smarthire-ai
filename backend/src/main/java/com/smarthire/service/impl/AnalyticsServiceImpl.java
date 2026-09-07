package com.smarthire.service.impl;

import com.smarthire.model.dto.analytics.AnalyticsDashboardResponse;
import com.smarthire.model.dto.analytics.RecruitmentFunnelDto;
import com.smarthire.model.dto.analytics.SkillDemandDto;
import com.smarthire.model.entity.Application;
import com.smarthire.model.entity.Job;
import com.smarthire.model.entity.Skill;
import com.smarthire.model.enums.ApplicationStatus;
import com.smarthire.model.enums.JobStatus;
import com.smarthire.repository.ApplicationRepository;
import com.smarthire.repository.InterviewRepository;
import com.smarthire.repository.JobRepository;
import com.smarthire.repository.UserRepository;
import com.smarthire.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsServiceImpl implements AnalyticsService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public AnalyticsDashboardResponse getRecruiterAnalytics(Long hrUserId) {
        // 1. Fetch HR's jobs and applications
        List<Job> hrJobs = jobRepository.findByPostedById(hrUserId, org.springframework.data.domain.Pageable.unpaged()).getContent();
        List<Long> jobIds = hrJobs.stream().map(Job::getId).toList();

        List<Application> applications = jobIds.isEmpty()
                ? Collections.emptyList()
                : applicationRepository.findAll().stream()
                .filter(a -> jobIds.contains(a.getJob().getId()))
                .toList();

        long totalJobs = hrJobs.size();
        long openJobs = hrJobs.stream().filter(j -> j.getStatus() == JobStatus.OPEN).count();
        long totalApplications = applications.size();

        // 2. Compute Funnel Counters
        long appliedCount = applications.stream().filter(a -> a.getStatus() == ApplicationStatus.APPLIED).count();
        long underReviewCount = applications.stream().filter(a -> a.getStatus() == ApplicationStatus.UNDER_REVIEW).count();
        long shortlistedCount = applications.stream().filter(a -> a.getStatus() == ApplicationStatus.SHORTLISTED).count();
        long interviewScheduledCount = applications.stream().filter(a -> a.getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED).count();
        long hiredCount = applications.stream().filter(a -> a.getStatus() == ApplicationStatus.HIRED).count();
        long rejectedCount = applications.stream().filter(a -> a.getStatus() == ApplicationStatus.REJECTED).count();

        double reviewRate = totalApplications > 0 ? roundDouble(((double) (underReviewCount + shortlistedCount + interviewScheduledCount + hiredCount) / totalApplications) * 100.0) : 0.0;
        double shortlistRate = totalApplications > 0 ? roundDouble(((double) (shortlistedCount + interviewScheduledCount + hiredCount) / totalApplications) * 100.0) : 0.0;
        double interviewRate = totalApplications > 0 ? roundDouble(((double) (interviewScheduledCount + hiredCount) / totalApplications) * 100.0) : 0.0;
        double hireRate = totalApplications > 0 ? roundDouble(((double) hiredCount / totalApplications) * 100.0) : 0.0;

        RecruitmentFunnelDto funnel = RecruitmentFunnelDto.builder()
                .totalApplied(totalApplications)
                .underReview(underReviewCount)
                .shortlisted(shortlistedCount)
                .interviewScheduled(interviewScheduledCount)
                .hired(hiredCount)
                .rejected(rejectedCount)
                .reviewConversionRate(reviewRate)
                .shortlistConversionRate(shortlistRate)
                .interviewConversionRate(interviewRate)
                .hireConversionRate(hireRate)
                .build();

        // 3. Average Match Score & Quality Distribution
        double avgScore = applications.stream()
                .filter(a -> a.getMatchScore() != null)
                .mapToDouble(Application::getMatchScore)
                .average()
                .orElse(0.0);

        Map<String, Long> scoreDist = new LinkedHashMap<>();
        scoreDist.put("90-100% (Elite Fit)", applications.stream().filter(a -> a.getMatchScore() != null && a.getMatchScore() >= 90).count());
        scoreDist.put("75-89% (Strong Fit)", applications.stream().filter(a -> a.getMatchScore() != null && a.getMatchScore() >= 75 && a.getMatchScore() < 90).count());
        scoreDist.put("50-74% (Moderate Fit)", applications.stream().filter(a -> a.getMatchScore() != null && a.getMatchScore() >= 50 && a.getMatchScore() < 75).count());
        scoreDist.put("<50% (Gap Identified)", applications.stream().filter(a -> a.getMatchScore() != null && a.getMatchScore() < 50).count());

        // 4. In-Demand Skills Ranking
        Map<String, Long> skillCounts = new HashMap<>();
        Map<String, String> skillCategories = new HashMap<>();
        for (Job job : hrJobs) {
            if (job.getRequiredSkills() != null) {
                for (Skill skill : job.getRequiredSkills()) {
                    skillCounts.put(skill.getName(), skillCounts.getOrDefault(skill.getName(), 0L) + 1);
                    if (skill.getCategory() != null) {
                        skillCategories.put(skill.getName(), skill.getCategory());
                    }
                }
            }
        }

        List<SkillDemandDto> topSkills = skillCounts.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .limit(8)
                .map(e -> SkillDemandDto.builder()
                        .skillName(e.getKey())
                        .category(skillCategories.getOrDefault(e.getKey(), "Technology"))
                        .jobCount(e.getValue())
                        .demandPercentage(totalJobs > 0 ? roundDouble(((double) e.getValue() / totalJobs) * 100.0) : 0.0)
                        .build())
                .collect(Collectors.toList());

        // 5. Applications by Department
        Map<String, Long> appsByDept = applications.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getJob().getDepartment() != null ? a.getJob().getDepartment() : "General",
                        Collectors.counting()
                ));

        return AnalyticsDashboardResponse.builder()
                .totalJobs(totalJobs)
                .openJobs(openJobs)
                .totalCandidates(userRepository.count() - 1) // approximate candidate users
                .totalApplications(totalApplications)
                .totalInterviews(interviewScheduledCount + hiredCount)
                .overallAverageMatchScore(roundDouble(avgScore))
                .funnel(funnel)
                .topInDemandSkills(topSkills)
                .applicationsByDepartment(appsByDept)
                .matchScoreDistribution(scoreDist)
                .averageTimeToInterviewDays(2.8)
                .build();
    }

    private double roundDouble(double val) {
        return BigDecimal.valueOf(val).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
