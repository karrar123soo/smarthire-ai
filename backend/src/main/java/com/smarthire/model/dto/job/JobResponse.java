package com.smarthire.model.dto.job;

import com.smarthire.model.enums.JobStatus;
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
public class JobResponse {

    private Long id;
    private String title;
    private String description;
    private String department;
    private String location;
    private JobType jobType;
    private Integer experienceYearsRequired;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private JobStatus status;

    // Recruiter / Company context
    private Long postedById;
    private String postedByName;
    private String companyName;
    private String companyWebsite;

    private List<String> requiredSkills;
    private long applicantsCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
