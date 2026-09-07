package com.smarthire.model.dto.interview;

import com.smarthire.model.enums.ApplicationStatus;
import com.smarthire.model.enums.InterviewStatus;
import com.smarthire.model.enums.InterviewType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewResponse {
    private Long id;
    private Long applicationId;
    private Long jobId;
    private String jobTitle;
    private String jobDepartment;
    private String companyName;
    
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String candidateHeadline;

    private Long interviewerId;
    private String interviewerName;

    private LocalDateTime interviewDateTime;
    private Integer durationMinutes;
    private InterviewType interviewType;
    private String meetingLink;
    private InterviewStatus status;
    private ApplicationStatus currentApplicationStatus;

    private String feedback;
    private Integer rating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
