package com.smarthire.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemHealthDto {
    private String status; // UP, DEGRADED, DOWN
    private String databaseStatus;
    private String serviceName;
    private String version;
    private String environment;
    private LocalDateTime timestamp;
    private Map<String, Object> metrics;
    private Map<String, Boolean> features;
}
