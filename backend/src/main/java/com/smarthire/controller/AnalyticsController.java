package com.smarthire.controller;

import com.smarthire.model.dto.ApiResponse;
import com.smarthire.model.dto.analytics.AnalyticsDashboardResponse;
import com.smarthire.model.entity.User;
import com.smarthire.repository.UserRepository;
import com.smarthire.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Recruitment Analytics & Insights", description = "Endpoints for executive recruitment analytics, conversion funnel, and skills demand")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;

    private Long getUserIdFromAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Unauthenticated access");
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + authentication.getName()));
        return user.getId();
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get recruitment analytics & funnel insights", description = "Returns recruitment funnel conversion rates, skill demand heatmap, match score distribution, and hiring KPIs")
    public ResponseEntity<ApiResponse<AnalyticsDashboardResponse>> getRecruiterAnalytics(Authentication authentication) {
        Long hrUserId = getUserIdFromAuth(authentication);
        AnalyticsDashboardResponse response = analyticsService.getRecruiterAnalytics(hrUserId);
        return ResponseEntity.ok(ApiResponse.success(response, "Recruiter analytics retrieved successfully"));
    }
}
