package com.smarthire.model.dto.resume;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeResponse {
    private Long id;
    private Long candidateId;
    private String candidateName;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String filePath;
    private String rawTextPreview;
    private String extractedSummary;
    private Integer extractedYearsOfExperience;
    private String extractedEducation;
    private String extractedHeadline;
    private List<String> extractedSkills;
    private LocalDateTime uploadedAt;
}
