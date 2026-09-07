package com.smarthire.service;

import com.smarthire.model.dto.job.PageResponse;
import com.smarthire.model.dto.notification.NotificationResponse;

public interface NotificationService {
    PageResponse<NotificationResponse> getUserNotifications(Long userId, int page, int size);
    long getUnreadCount(Long userId);
    NotificationResponse markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
}
