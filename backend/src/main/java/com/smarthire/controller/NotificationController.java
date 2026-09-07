package com.smarthire.controller;

import com.smarthire.model.dto.ApiResponse;
import com.smarthire.model.dto.job.PageResponse;
import com.smarthire.model.dto.notification.NotificationResponse;
import com.smarthire.model.entity.User;
import com.smarthire.repository.UserRepository;
import com.smarthire.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "In-App Notification Center", description = "Endpoints for real-time notifications, unread counters, and read state management")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private Long getUserIdFromAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Unauthenticated access");
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + authentication.getName()));
        return user.getId();
    }

    @GetMapping
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get user's notifications", description = "Paginated list of user notifications sorted by newest first")
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getUserNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Long userId = getUserIdFromAuth(authentication);
        PageResponse<NotificationResponse> response = notificationService.getUserNotifications(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response, "Notifications retrieved successfully"));
    }

    @GetMapping("/unread-count")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get unread notification count", description = "Fast counter for navbar badge")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count), "Unread notification count retrieved"));
    }

    @PatchMapping("/{id}/read")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Mark single notification as read", description = "Updates isRead state to true")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = getUserIdFromAuth(authentication);
        NotificationResponse response = notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Notification marked as read"));
    }

    @PatchMapping("/mark-all-read")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Mark all notifications as read", description = "1-click action to clear all unread badges")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", "Notifications updated"));
    }
}
