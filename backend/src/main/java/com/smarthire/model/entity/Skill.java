package com.smarthire.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skills", indexes = {
    @Index(name = "idx_skill_name", columnList = "name", unique = true),
    @Index(name = "idx_skill_category", columnList = "category")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String name;

    @Column(length = 60)
    private String category;
}
