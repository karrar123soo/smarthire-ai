package com.smarthire.model.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillDemandDto {
    private String skillName;
    private String category;
    private long jobCount;
    private double demandPercentage;
}
