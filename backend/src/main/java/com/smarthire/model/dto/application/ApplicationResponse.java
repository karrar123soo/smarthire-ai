package com.smarthire.model.dto.application;

import com.smarthire.model.enums.ApplicationStatus;
import com.smarthire.model.enums.JobType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {

    private Long id;

    // Job Snapshot
    private Long jobId;
    private String jobTitle;
    private String jobDepartment;
    private String jobLocation;
    private JobType jobType;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String companyName;
    private List<String> requiredSkills;

    // Candidate Snapshot
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String candidatePhone;
    private String candidateHeadline;
    private Integer candidateYearsOfExperience;
    private String candidateLocation;
    private List<String> candidateSkills;

    // Application & Matching Info
    private ApplicationStatus status;
    private Double matchScore; // 0.0 - 100.0
    private String matchDetailsJson;
    private String candidateNotes;
    private String hrNotes;

    private Long resumeId;
    private String resumeFileName;

    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
