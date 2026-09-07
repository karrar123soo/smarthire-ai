package com.smarthire.model.dto.job;

import com.smarthire.model.enums.JobStatus;
import com.smarthire.model.enums.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateJobRequest {

    @NotBlank(message = "Job title is required")
    @Size(max = 150, message = "Job title cannot exceed 150 characters")
    private String title;

    @NotBlank(message = "Job description is required")
    private String description;

    @Size(max = 100, message = "Department cannot exceed 100 characters")
    private String department;

    @Size(max = 100, message = "Location cannot exceed 100 characters")
    private String location;

    @NotNull(message = "Job type is required")
    private JobType jobType;

    @PositiveOrZero(message = "Required experience must be 0 or positive")
    private Integer experienceYearsRequired;

    private BigDecimal minSalary;
    private BigDecimal maxSalary;

    @NotNull(message = "Job status is required")
    private JobStatus status;

    private List<String> requiredSkills;
}
