package com.smarthire.controller;

import com.smarthire.model.dto.ApiResponse;
import com.smarthire.model.dto.job.*;
import com.smarthire.model.entity.User;
import com.smarthire.model.enums.JobStatus;
import com.smarthire.model.enums.JobType;
import com.smarthire.repository.UserRepository;
import com.smarthire.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@Tag(name = "Job Management & Discovery", description = "Endpoints for posting, managing, searching, and filtering job requisitions")
public class JobController {

    private final JobService jobService;
    private final UserRepository userRepository;

    private Long getUserIdFromAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Unauthenticated access");
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + authentication.getName()));
        return user.getId();
    }

    @GetMapping
    @Operation(summary = "Search and filter open jobs", description = "Public & candidate job board search with keyword matching, jobType, department, location, experience, and pagination")
    public ResponseEntity<ApiResponse<PageResponse<JobResponse>>> getAllJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) Integer maxExperience,
            @RequestParam(required = false) BigDecimal minSalary,
            @RequestParam(required = false) JobStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        JobFilterRequest filter = JobFilterRequest.builder()
                .keyword(keyword)
                .jobType(jobType)
                .department(department)
                .location(location)
                .minExperience(minExperience)
                .maxExperience(maxExperience)
                .minSalary(minSalary)
                .status(status)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDir(sortDir)
                .build();

        PageResponse<JobResponse> response = jobService.getAllJobs(filter);
        return ResponseEntity.ok(ApiResponse.success(response, "Jobs retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get job details by ID", description = "Retrieves complete requisition details, recruiter profile, and required skills")
    public ResponseEntity<ApiResponse<JobResponse>> getJobById(@PathVariable Long id) {
        JobResponse response = jobService.getJobById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Job details retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Post a new job requisition", description = "Allows HR Recruiters to create a new job posting with skill requirements")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(
            Authentication authentication,
            @Valid @RequestBody CreateJobRequest request
    ) {
        Long hrUserId = getUserIdFromAuth(authentication);
        JobResponse response = jobService.createJob(request, hrUserId);
        return new ResponseEntity<>(ApiResponse.success(response, "Job requisition created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Update an existing job requisition", description = "Updates job details; only the job creator or an administrator can modify it")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateJobRequest request
    ) {
        Long hrUserId = getUserIdFromAuth(authentication);
        JobResponse response = jobService.updateJob(id, request, hrUserId);
        return ResponseEntity.ok(ApiResponse.success(response, "Job requisition updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Delete a job requisition", description = "Removes a job posting; only the job creator or an administrator can delete it")
    public ResponseEntity<ApiResponse<String>> deleteJob(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long hrUserId = getUserIdFromAuth(authentication);
        jobService.deleteJob(id, hrUserId);
        return ResponseEntity.ok(ApiResponse.success("Job deleted successfully", "Requisition deleted"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Change job requisition status", description = "Quick status change (e.g. OPEN, CLOSED, DRAFT, ARCHIVED)")
    public ResponseEntity<ApiResponse<JobResponse>> changeJobStatus(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam JobStatus status
    ) {
        Long hrUserId = getUserIdFromAuth(authentication);
        JobResponse response = jobService.changeJobStatus(id, status, hrUserId);
        return ResponseEntity.ok(ApiResponse.success(response, "Job status updated to " + status));
    }

    @GetMapping("/my-jobs")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get HR recruiter's own job postings", description = "Paginated list of all job postings created by the authenticated recruiter")
    public ResponseEntity<ApiResponse<PageResponse<JobResponse>>> getMyJobs(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Long hrUserId = getUserIdFromAuth(authentication);
        PageResponse<JobResponse> response = jobService.getMyJobs(hrUserId, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response, "Recruiter jobs retrieved successfully"));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get HR recruiter job requisition statistics", description = "Counts of total, open, draft, and closed jobs for the recruiter")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getJobStats(Authentication authentication) {
        Long hrUserId = getUserIdFromAuth(authentication);
        Map<String, Object> stats = jobService.getJobStats(hrUserId);
        return ResponseEntity.ok(ApiResponse.success(stats, "Recruiter job statistics retrieved successfully"));
    }
}
