package com.smarthire.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "resumes", indexes = {
    @Index(name = "idx_resume_candidate", columnList = "candidate_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(length = 100)
    private String fileType;

    private Long fileSize;

    @Column(nullable = false, length = 500)
    private String filePath;

    @Column(columnDefinition = "LONGTEXT")
    private String rawText;

    @Column(columnDefinition = "TEXT")
    private String extractedSummary;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }
}
