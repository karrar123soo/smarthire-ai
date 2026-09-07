package com.smarthire.model.dto.interview;

import com.smarthire.model.enums.InterviewType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleInterviewRequest {

    @NotNull(message = "Application ID is required")
    private Long applicationId;

    @NotNull(message = "Interview date and time is required")
    @Future(message = "Interview date and time must be in the future")
    private LocalDateTime interviewDateTime;

    @Builder.Default
    private Integer durationMinutes = 45;

    @Builder.Default
    private InterviewType interviewType = InterviewType.TECHNICAL;

    private String meetingLink;

    private String customNotes;
}
