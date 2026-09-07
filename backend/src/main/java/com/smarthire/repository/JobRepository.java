package com.smarthire.repository;

import com.smarthire.model.entity.Job;
import com.smarthire.model.enums.JobStatus;
import com.smarthire.model.enums.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    Page<Job> findByPostedById(Long hrUserId, Pageable pageable);

    List<Job> findByPostedById(Long hrUserId);

    long countByStatus(JobStatus status);

    long countByPostedById(Long hrUserId);

    long countByPostedByIdAndStatus(Long hrUserId, JobStatus status);

    @Query("SELECT j FROM Job j WHERE " +
           "(:status IS NULL OR j.status = :status) AND " +
           "(:jobType IS NULL OR j.jobType = :jobType) AND " +
           "(:department IS NULL OR LOWER(j.department) LIKE LOWER(CONCAT('%', :department, '%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minExperience IS NULL OR j.experienceYearsRequired >= :minExperience) AND " +
           "(:maxExperience IS NULL OR j.experienceYearsRequired <= :maxExperience) AND " +
           "(:minSalary IS NULL OR j.maxSalary >= :minSalary) AND " +
           "(:keyword IS NULL OR " +
           "   LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "   LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "   LOWER(j.department) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "   LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Job> filterJobs(
            @Param("keyword") String keyword,
            @Param("jobType") JobType jobType,
            @Param("department") String department,
            @Param("location") String location,
            @Param("minExperience") Integer minExperience,
            @Param("maxExperience") Integer maxExperience,
            @Param("minSalary") BigDecimal minSalary,
            @Param("status") JobStatus status,
            Pageable pageable
    );
}
