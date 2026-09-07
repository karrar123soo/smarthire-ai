package com.smarthire.repository;

import com.smarthire.model.entity.Resume;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByCandidateIdOrderByUploadedAtDesc(Long candidateId);
    Page<Resume> findByCandidateId(Long candidateId, Pageable pageable);
    Optional<Resume> findFirstByCandidateIdOrderByUploadedAtDesc(Long candidateId);
    boolean existsByCandidateId(Long candidateId);
}
