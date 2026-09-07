package com.smarthire.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hr_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HRProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 120)
    private String companyName;

    @Column(length = 255)
    private String companyWebsite;

    @Column(columnDefinition = "TEXT")
    private String companyDescription;

    @Column(length = 100)
    private String department;

    @Column(length = 100)
    private String designation;
}
