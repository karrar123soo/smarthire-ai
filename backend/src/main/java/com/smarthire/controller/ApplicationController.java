package com.smarthire.controller;

import com.smarthire.model.dto.ApiResponse;
import com.smarthire.model.dto.application.*;
import com.smarthire.model.dto.job.PageResponse;
import com.smarthire.model.entity.User;
import com.smarthire.model.enums.ApplicationStatus;
import com.smarthire.repository.UserRepository;
import com.smarthire.service.ApplicationService;
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

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Tag(name = "Application & Recruitment Pipeline", description = "Endpoints for job applications, candidate tracking, and HR recruitment pipeline management")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserRepository userRepository;

    private Long getUserIdFromAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Unauthenticated access");
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + authentication.getName()));
        return user.getId();
    }

    @PostMapping("/apply")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Submit a job application", description = "Allows a candidate to apply to an open job requisition with automated skill matching")
    public ResponseEntity<ApiResponse<ApplicationResponse>> applyToJob(
            Authentication authentication,
            @Valid @RequestBody ApplyJobRequest request
    ) {
        Long candidateUserId = getUserIdFromAuth(authentication);
        ApplicationResponse response = applicationService.applyToJob(request, candidateUserId);
        return new ResponseEntity<>(ApiResponse.success(response, "Job application submitted successfully"), HttpStatus.CREATED);
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get candidate's submitted applications", description = "Paginated list of all applications submitted by the logged-in candidate")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> getMyApplications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appliedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Long candidateUserId = getUserIdFromAuth(authentication);
        PageResponse<ApplicationResponse> response = applicationService.getMyApplications(candidateUserId, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response, "Candidate applications retrieved successfully"));
    }

    @GetMapping("/{id}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get application details by ID", description = "Accessible by the applicant candidate or the posting HR recruiter")
    public ResponseEntity<ApiResponse<ApplicationResponse>> getApplicationById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = getUserIdFromAuth(authentication);
        ApplicationResponse response = applicationService.getApplicationById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Application details retrieved successfully"));
    }

    @DeleteMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Withdraw an active job application", description = "Allows candidate to cancel a submitted application prior to final hiring")
    public ResponseEntity<ApiResponse<String>> withdrawApplication(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long candidateUserId = getUserIdFromAuth(authentication);
        applicationService.withdrawApplication(id, candidateUserId);
        return ResponseEntity.ok(ApiResponse.success("Application withdrawn successfully", "Application withdrawn"));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get candidate applications for a specific job", description = "Paginated and ranked list of candidates who applied to a specific requisition")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> getJobApplications(
            Authentication authentication,
            @PathVariable Long jobId,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) Double minScore,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long hrUserId = getUserIdFromAuth(authentication);
        PageResponse<ApplicationResponse> response = applicationService.getJobApplications(jobId, status, minScore, page, size, hrUserId);
        return ResponseEntity.ok(ApiResponse.success(response, "Job candidates retrieved successfully"));
    }

    @GetMapping("/recruiter-pipeline")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get recruiter's candidate pipeline", description = "All candidate applications across all jobs posted by the recruiter")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> getRecruiterPipeline(
            Authentication authentication,
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Long hrUserId = getUserIdFromAuth(authentication);
        PageResponse<ApplicationResponse> response = applicationService.getRecruiterPipeline(hrUserId, jobId, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(response, "Recruiter pipeline retrieved successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Advance candidate recruitment pipeline stage", description = "Allows HR recruiter to update stage (Review, Shortlist, Schedule Interview, Reject, Hire) and add HR notes")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateApplicationStatus(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateApplicationStatusRequest request
    ) {
        Long hrUserId = getUserIdFromAuth(authentication);
        ApplicationResponse response = applicationService.updateApplicationStatus(id, request, hrUserId);
        return ResponseEntity.ok(ApiResponse.success(response, "Candidate application stage updated to " + request.getStatus()));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get recruiter's pipeline funnel metrics", description = "Funnel counters across all recruitment stages and average candidate match score")
    public ResponseEntity<ApiResponse<PipelineStatsResponse>> getPipelineStats(Authentication authentication) {
        Long hrUserId = getUserIdFromAuth(authentication);
        PipelineStatsResponse stats = applicationService.getPipelineStats(hrUserId);
        return ResponseEntity.ok(ApiResponse.success(stats, "Pipeline funnel statistics retrieved successfully"));
    }
}
