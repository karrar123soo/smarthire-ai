package com.smarthire.controller;

import com.smarthire.model.dto.ApiResponse;
import com.smarthire.model.dto.interview.InterviewFeedbackRequest;
import com.smarthire.model.dto.interview.InterviewResponse;
import com.smarthire.model.dto.interview.ScheduleInterviewRequest;
import com.smarthire.model.dto.job.PageResponse;
import com.smarthire.model.entity.User;
import com.smarthire.repository.UserRepository;
import com.smarthire.service.InterviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/interviews")
@RequiredArgsConstructor
@Tag(name = "Interview Scheduling & Evaluation", description = "Endpoints for scheduling interviews, candidate calendars, and recruiter evaluation scorecards")
public class InterviewController {

    private final InterviewService interviewService;
    private final UserRepository userRepository;

    private Long getUserIdFromAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Unauthenticated access");
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + authentication.getName()));
        return user.getId();
    }

    @PostMapping("/schedule")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Schedule candidate interview", description = "Allows recruiter to schedule technical/HR interview with automated meeting link generation and candidate notification")
    public ResponseEntity<ApiResponse<InterviewResponse>> scheduleInterview(
            Authentication authentication,
            @Valid @RequestBody ScheduleInterviewRequest request
    ) {
        Long hrUserId = getUserIdFromAuth(authentication);
        InterviewResponse response = interviewService.scheduleInterview(request, hrUserId);
        return new ResponseEntity<>(ApiResponse.success(response, "Interview scheduled successfully"), HttpStatus.CREATED);
    }

    @GetMapping("/my-interviews")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get user's interview schedule", description = "Returns candidate's upcoming/past interviews or HR recruiter's interview calendar")
    public ResponseEntity<ApiResponse<PageResponse<InterviewResponse>>> getMyInterviews(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = getUserIdFromAuth(authentication);
        PageResponse<InterviewResponse> response = interviewService.getMyInterviews(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response, "Interviews retrieved successfully"));
    }

    @GetMapping("/{id}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get interview details by ID", description = "Accessible by candidate or recruiter")
    public ResponseEntity<ApiResponse<InterviewResponse>> getInterviewById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = getUserIdFromAuth(authentication);
        InterviewResponse response = interviewService.getInterviewById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Interview retrieved successfully"));
    }

    @PostMapping("/{id}/feedback")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Submit interview evaluation scorecard & rating", description = "Records rating (1-10) and structured comments, with optional 1-click status advance to HIRED or REJECTED")
    public ResponseEntity<ApiResponse<InterviewResponse>> submitFeedback(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody InterviewFeedbackRequest request
    ) {
        Long hrUserId = getUserIdFromAuth(authentication);
        InterviewResponse response = interviewService.submitFeedback(id, request, hrUserId);
        return ResponseEntity.ok(ApiResponse.success(response, "Interview feedback and rating submitted successfully"));
    }

    @PatchMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Reschedule an interview", description = "Updates interview date/time and notifies the candidate")
    public ResponseEntity<ApiResponse<InterviewResponse>> rescheduleInterview(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime newDateTime,
            @RequestParam(required = false) String newMeetingLink
    ) {
        Long hrUserId = getUserIdFromAuth(authentication);
        InterviewResponse response = interviewService.rescheduleInterview(id, newDateTime, newMeetingLink, hrUserId);
        return ResponseEntity.ok(ApiResponse.success(response, "Interview rescheduled successfully"));
    }

    @DeleteMapping("/{id}/cancel")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Cancel a scheduled interview", description = "Cancels the session and sends notification to candidate")
    public ResponseEntity<ApiResponse<String>> cancelInterview(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam(required = false) String reason
    ) {
        Long hrUserId = getUserIdFromAuth(authentication);
        interviewService.cancelInterview(id, reason, hrUserId);
        return ResponseEntity.ok(ApiResponse.success("Interview cancelled successfully", "Interview cancelled"));
    }
}
