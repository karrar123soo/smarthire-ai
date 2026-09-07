package com.smarthire.controller;

import com.smarthire.model.dto.ApiResponse;
import com.smarthire.model.dto.SystemHealthDto;
import com.smarthire.service.HealthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
@Tag(name = "Health & Diagnostics", description = "Endpoints for monitoring server health, database connectivity, and runtime metrics")
public class HealthController {

    private final HealthService healthService;

    @GetMapping
    @Operation(summary = "Basic ping health check", description = "Returns basic heartbeat status of the SmartHire AI backend service")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBasicHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "SmartHire AI Backend");
        health.put("version", "1.0.0");
        return ResponseEntity.ok(ApiResponse.success(health, "SmartHire AI backend is operational"));
    }

    @GetMapping("/system-info")
    @Operation(summary = "Comprehensive system diagnostic info", description = "Returns deep health diagnostic data including database status, JVM memory usage, and feature readiness")
    public ResponseEntity<ApiResponse<SystemHealthDto>> getSystemInfo() {
        SystemHealthDto healthDto = healthService.getSystemHealth();
        return ResponseEntity.ok(ApiResponse.success(healthDto, "System diagnostics retrieved successfully"));
    }
}
