package com.smarthire.service;

import com.smarthire.model.dto.analytics.AnalyticsDashboardResponse;

public interface AnalyticsService {
    AnalyticsDashboardResponse getRecruiterAnalytics(Long hrUserId);
}
