package com.smarthire.service.impl;

import com.smarthire.exception.ResourceNotFoundException;
import com.smarthire.exception.UnauthorizedException;
import com.smarthire.model.dto.job.PageResponse;
import com.smarthire.model.dto.notification.NotificationResponse;
import com.smarthire.model.entity.Notification;
import com.smarthire.repository.NotificationRepository;
import com.smarthire.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getUserNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> notifPage = notificationRepository.findByRecipientId(userId, pageable);

        List<NotificationResponse> content = notifPage.getContent().stream()
                .map(this::mapToNotificationResponse)
                .collect(Collectors.toList());

        return PageResponse.<NotificationResponse>builder()
                .content(content)
                .pageNumber(notifPage.getNumber())
                .pageSize(notifPage.getSize())
                .totalElements(notifPage.getTotalElements())
                .totalPages(notifPage.getTotalPages())
                .isFirst(notifPage.isFirst())
                .isLast(notifPage.isLast())
                .hasNext(notifPage.hasNext())
                .hasPrevious(notifPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to access this notification");
        }

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return mapToNotificationResponse(saved);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }

    private NotificationResponse mapToNotificationResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .recipientId(n.getRecipient().getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .relativeTime(getRelativeTime(n.getCreatedAt()))
                .build();
    }

    private String getRelativeTime(LocalDateTime dateTime) {
        if (dateTime == null) return "Just now";
        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long seconds = duration.getSeconds();

        if (seconds < 60) return "Just now";
        if (seconds < 3600) return (seconds / 60) + "m ago";
        if (seconds < 86400) return (seconds / 3600) + "h ago";
        return (seconds / 86400) + "d ago";
    }
}
