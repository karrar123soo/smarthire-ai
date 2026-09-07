package com.smarthire.model.entity;

import com.smarthire.model.enums.InterviewStatus;
import com.smarthire.model.enums.InterviewType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interviews", indexes = {
    @Index(name = "idx_interview_app", columnList = "application_id"),
    @Index(name = "idx_interview_status", columnList = "status"),
    @Index(name = "idx_interview_date", columnList = "interview_date_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewer_id")
    private User interviewer;

    @Column(name = "interview_date_time", nullable = false)
    private LocalDateTime interviewDateTime;

    @Column(nullable = false)
    @Builder.Default
    private Integer durationMinutes = 45;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private InterviewType interviewType = InterviewType.TECHNICAL;

    @Column(length = 500)
    private String meetingLink;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private Integer rating; // 1 to 10 scale

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
