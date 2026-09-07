package com.smarthire.model.entity;

import com.smarthire.model.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications", indexes = {
    @Index(name = "idx_app_job_candidate", columnList = "job_id, candidate_id", unique = true),
    @Index(name = "idx_app_status", columnList = "status"),
    @Index(name = "idx_app_match_score", columnList = "match_score")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(name = "match_score")
    private Double matchScore; // 0.0 to 100.0

    @Column(columnDefinition = "LONGTEXT")
    private String matchDetailsJson;

    @Column(columnDefinition = "TEXT")
    private String candidateNotes;

    @Column(columnDefinition = "TEXT")
    private String hrNotes;

    @Column(name = "applied_at", nullable = false, updatable = false)
    private LocalDateTime appliedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.appliedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
