package com.smarthire.model.dto.job;

import com.smarthire.model.enums.JobStatus;
import com.smarthire.model.enums.JobType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobFilterRequest {

    private String keyword;
    private JobType jobType;
    private String department;
    private String location;
    private Integer minExperience;
    private Integer maxExperience;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private JobStatus status; // defaults to OPEN if null in public search

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 10;

    @Builder.Default
    private String sortBy = "createdAt";

    @Builder.Default
    private String sortDir = "desc";
}
