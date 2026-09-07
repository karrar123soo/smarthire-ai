package com.smarthire.service.impl;

import com.smarthire.model.dto.SystemHealthDto;
import com.smarthire.repository.UserRepository;
import com.smarthire.service.HealthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthServiceImpl implements HealthService {

    private final UserRepository userRepository;

    @Override
    public SystemHealthDto getSystemHealth() {
        String dbStatus = "UP";
        try {
            userRepository.count();
        } catch (Exception e) {
            log.error("Database connection check failed: {}", e.getMessage());
            dbStatus = "DOWN: " + e.getMessage();
        }

        Runtime runtime = Runtime.getRuntime();
        long totalMemoryMb = runtime.totalMemory() / (1024 * 1024);
        long freeMemoryMb = runtime.freeMemory() / (1024 * 1024);
        long usedMemoryMb = totalMemoryMb - freeMemoryMb;

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("usedMemoryMb", usedMemoryMb);
        metrics.put("totalMemoryMb", totalMemoryMb);
        metrics.put("freeMemoryMb", freeMemoryMb);
        metrics.put("availableProcessors", runtime.availableProcessors());

        Map<String, Boolean> features = new HashMap<>();
        features.put("authModule", true);
        features.put("hrPortal", true);
        features.put("candidatePortal", true);
        features.put("aiResumeExtraction", true);
        features.put("aiSkillMatching", true);
        features.put("interviewScheduling", true);
        features.put("liveNotifications", true);

        return SystemHealthDto.builder()
                .status("UP".equals(dbStatus) ? "UP" : "DEGRADED")
                .databaseStatus(dbStatus)
                .serviceName("SmartHire AI Recruitment Backend")
                .version("1.0.0-PROD")
                .environment("development")
                .timestamp(LocalDateTime.now())
                .metrics(metrics)
                .features(features)
                .build();
    }
}
