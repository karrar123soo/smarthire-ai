package com.smarthire.model.dto.interview;

import com.smarthire.model.enums.ApplicationStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewFeedbackRequest {

    @NotNull(message = "Overall rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 10")
    @Max(value = 10, message = "Rating must be between 1 and 10")
    private Integer rating;

    @NotBlank(message = "Interview feedback is required")
    private String feedback;

    // Optional multi-factor dimensional scores (1-10)
    private Integer technicalScore;
    private Integer problemSolvingScore;
    private Integer communicationScore;
    private Integer cultureFitScore;

    // Optional quick status advance: HIRED, REJECTED, or null (remains in interview stage)
    private ApplicationStatus advanceApplicationStatus;
}
