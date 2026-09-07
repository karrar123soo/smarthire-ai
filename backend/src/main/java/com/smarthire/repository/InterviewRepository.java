package com.smarthire.repository;

import com.smarthire.model.entity.Interview;
import com.smarthire.model.enums.InterviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationId(Long applicationId);
    Optional<Interview> findFirstByApplicationIdOrderByCreatedAtDesc(Long applicationId);
    List<Interview> findByInterviewerIdOrderByInterviewDateTimeAsc(Long interviewerId);

    @Query("SELECT i FROM Interview i WHERE i.application.candidate.id = :candidateId ORDER BY i.interviewDateTime DESC")
    Page<Interview> findByCandidateId(@Param("candidateId") Long candidateId, Pageable pageable);

    @Query("SELECT i FROM Interview i WHERE i.application.candidate.id = :candidateId ORDER BY i.interviewDateTime ASC")
    List<Interview> findByCandidateIdList(@Param("candidateId") Long candidateId);

    @Query("SELECT i FROM Interview i WHERE i.application.job.postedBy.id = :hrUserId ORDER BY i.interviewDateTime DESC")
    Page<Interview> findByHrUserId(@Param("hrUserId") Long hrUserId, Pageable pageable);

    @Query("SELECT i FROM Interview i WHERE i.application.job.id = :jobId ORDER BY i.interviewDateTime DESC")
    List<Interview> findByJobId(@Param("jobId") Long jobId);

    long countByStatus(InterviewStatus status);
}
