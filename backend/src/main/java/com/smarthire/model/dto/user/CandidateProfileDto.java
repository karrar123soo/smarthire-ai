package com.smarthire.model.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfileDto {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String headline;
    private String summary;
    private Integer yearsOfExperience;
    private String location;
    private String education;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private List<String> skills;
}
