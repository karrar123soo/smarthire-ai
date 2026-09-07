package com.smarthire.model.dto.application;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplyJobRequest {

    @NotNull(message = "Job ID is required to apply")
    private Long jobId;

    @Size(max = 2000, message = "Candidate notes cannot exceed 2000 characters")
    private String candidateNotes;

    private Long resumeId;
}
