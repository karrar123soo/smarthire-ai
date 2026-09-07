package com.smarthire.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "candidate_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 150)
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String summary;

    private Integer yearsOfExperience;

    @Column(length = 100)
    private String location;

    @Column(length = 150)
    private String education;

    @Column(length = 255)
    private String linkedinUrl;

    @Column(length = 255)
    private String githubUrl;

    @Column(length = 255)
    private String portfolioUrl;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "candidate_skills",
        joinColumns = @JoinColumn(name = "candidate_profile_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @Builder.Default
    private Set<Skill> skills = new HashSet<>();
}
