package com.smarthire.model.dto.application;

import com.smarthire.model.enums.ApplicationStatus;
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
public class UpdateApplicationStatusRequest {

    @NotNull(message = "Application status is required")
    private ApplicationStatus status;

    @Size(max = 2000, message = "HR notes cannot exceed 2000 characters")
    private String hrNotes;
}
