package com.smarthire.model.dto.resume;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParsedSkillSyncRequest {
    private String headline;
    private String summary;
    private Integer yearsOfExperience;
    private String education;
    private String location;
    private List<String> skills;
}
