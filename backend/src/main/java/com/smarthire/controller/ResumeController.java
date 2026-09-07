package com.smarthire.controller;

import com.smarthire.model.dto.ApiResponse;
import com.smarthire.model.dto.job.PageResponse;
import com.smarthire.model.dto.resume.ParsedSkillSyncRequest;
import com.smarthire.model.dto.resume.ResumeResponse;
import com.smarthire.model.entity.User;
import com.smarthire.repository.UserRepository;
import com.smarthire.service.ResumeParserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/resumes")
@RequiredArgsConstructor
@Tag(name = "AI Resume Parser", description = "Endpoints for uploading, parsing, extracting skills, and syncing candidate resumes")
public class ResumeController {

    private final ResumeParserService resumeParserService;
    private final UserRepository userRepository;

    private Long getUserIdFromAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Unauthenticated access");
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + authentication.getName()));
        return user.getId();
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Upload and parse candidate resume", description = "Extracts raw text, summary, years of experience, and matches skills against standard skills catalog")
    public ResponseEntity<ApiResponse<ResumeResponse>> uploadResume(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        Long candidateUserId = getUserIdFromAuth(authentication);
        ResumeResponse response = resumeParserService.parseAndUploadResume(file, candidateUserId);
        return new ResponseEntity<>(ApiResponse.success(response, "Resume uploaded and parsed successfully"), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get parsed resume details by ID", description = "Accessible by the candidate who uploaded it or HR recruiter/admin")
    public ResponseEntity<ApiResponse<ResumeResponse>> getResumeById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = getUserIdFromAuth(authentication);
        ResumeResponse response = resumeParserService.getResumeById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Resume details retrieved successfully"));
    }

    @GetMapping("/my-resumes")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get candidate's uploaded resumes", description = "Paginated list of candidate's uploaded and parsed resumes")
    public ResponseEntity<ApiResponse<PageResponse<ResumeResponse>>> getMyResumes(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long candidateUserId = getUserIdFromAuth(authentication);
        PageResponse<ResumeResponse> response = resumeParserService.getCandidateResumes(candidateUserId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response, "Resumes retrieved successfully"));
    }

    @GetMapping("/latest")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get candidate's most recent parsed resume", description = "Returns the latest uploaded resume for profile previews")
    public ResponseEntity<ApiResponse<ResumeResponse>> getLatestResume(Authentication authentication) {
        Long candidateUserId = getUserIdFromAuth(authentication);
        ResumeResponse response = resumeParserService.getLatestResume(candidateUserId);
        return ResponseEntity.ok(ApiResponse.success(response, "Latest resume retrieved"));
    }

    @PostMapping("/{id}/sync-profile")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Synchronize parsed resume attributes to Candidate Profile", description = "1-click action to update candidate headline, summary, years of experience, and link all extracted skills")
    public ResponseEntity<ApiResponse<ResumeResponse>> syncResumeToProfile(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody(required = false) ParsedSkillSyncRequest syncRequest
    ) {
        Long candidateUserId = getUserIdFromAuth(authentication);
        if (syncRequest == null) {
            syncRequest = new ParsedSkillSyncRequest();
        }
        ResumeResponse response = resumeParserService.syncResumeToProfile(id, syncRequest, candidateUserId);
        return ResponseEntity.ok(ApiResponse.success(response, "Candidate profile synchronized successfully with resume data"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Delete an uploaded resume", description = "Allows candidate to remove a resume from their library")
    public ResponseEntity<ApiResponse<String>> deleteResume(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long candidateUserId = getUserIdFromAuth(authentication);
        resumeParserService.deleteResume(id, candidateUserId);
        return ResponseEntity.ok(ApiResponse.success("Resume deleted successfully", "Resume deleted"));
    }
}
