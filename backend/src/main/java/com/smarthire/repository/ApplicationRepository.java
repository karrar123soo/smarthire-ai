package com.smarthire.repository;

import com.smarthire.model.entity.Application;
import com.smarthire.model.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Page<Application> findByCandidateId(Long candidateId, Pageable pageable);

    List<Application> findByCandidateIdOrderByAppliedAtDesc(Long candidateId);

    List<Application> findByJobIdOrderByMatchScoreDesc(Long jobId);

    Optional<Application> findByJobIdAndCandidateId(Long jobId, Long candidateId);

    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);

    long countByStatus(ApplicationStatus status);

    long countByJobPostedById(Long hrUserId);

    long countByJobPostedByIdAndStatus(Long hrUserId, ApplicationStatus status);

    @Query("SELECT AVG(a.matchScore) FROM Application a WHERE a.job.postedBy.id = :hrUserId AND a.matchScore IS NOT NULL")
    Double findAverageMatchScoreByHrUserId(@Param("hrUserId") Long hrUserId);

    @Query("SELECT a FROM Application a WHERE a.job.id = :jobId AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:minScore IS NULL OR a.matchScore >= :minScore)")
    Page<Application> filterJobApplications(
            @Param("jobId") Long jobId,
            @Param("status") ApplicationStatus status,
            @Param("minScore") Double minScore,
            Pageable pageable
    );

    @Query("SELECT a FROM Application a WHERE a.job.postedBy.id = :hrUserId AND " +
           "(:jobId IS NULL OR a.job.id = :jobId) AND " +
           "(:status IS NULL OR a.status = :status)")
    Page<Application> filterRecruiterApplications(
            @Param("hrUserId") Long hrUserId,
            @Param("jobId") Long jobId,
            @Param("status") ApplicationStatus status,
            Pageable pageable
    );
}
