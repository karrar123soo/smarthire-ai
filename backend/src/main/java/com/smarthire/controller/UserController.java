package com.smarthire.controller;

import com.smarthire.model.dto.ApiResponse;
import com.smarthire.model.dto.auth.ChangePasswordRequest;
import com.smarthire.model.dto.user.CandidateProfileDto;
import com.smarthire.model.dto.user.HRProfileDto;
import com.smarthire.model.dto.user.UserDto;
import com.smarthire.model.entity.User;
import com.smarthire.repository.UserRepository;
import com.smarthire.service.UserService;
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
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "User & Profile Management", description = "Endpoints for viewing and updating Candidate and HR profiles and passwords")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    private Long getUserIdFromAuth(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + authentication.getName()));
        return user.getId();
    }

    @GetMapping("/profile")
    @Operation(summary = "Get full user profile", description = "Retrieves the authenticated user's complete identity and profile details")
    public ResponseEntity<ApiResponse<UserDto>> getProfile(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        UserDto profile = userService.getUserProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile, "User profile retrieved successfully"));
    }

    @GetMapping("/candidate-profile")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('ADMIN')")
    @Operation(summary = "Get candidate profile", description = "Returns candidate headline, summary, experience, and skill tags")
    public ResponseEntity<ApiResponse<CandidateProfileDto>> getCandidateProfile(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        CandidateProfileDto profile = userService.getCandidateProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile, "Candidate profile retrieved successfully"));
    }

    @PutMapping("/candidate-profile")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('ADMIN')")
    @Operation(summary = "Update candidate profile", description = "Updates candidate headline, summary, experience, location, education, and skills")
    public ResponseEntity<ApiResponse<CandidateProfileDto>> updateCandidateProfile(
            Authentication authentication,
            @RequestBody CandidateProfileDto dto) {
        Long userId = getUserIdFromAuth(authentication);
        CandidateProfileDto updated = userService.updateCandidateProfile(userId, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Candidate profile updated successfully"));
    }

    @GetMapping("/hr-profile")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @Operation(summary = "Get HR recruiter profile", description = "Returns HR recruiter company name, website, department, and designation")
    public ResponseEntity<ApiResponse<HRProfileDto>> getHRProfile(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        HRProfileDto profile = userService.getHRProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile, "HR profile retrieved successfully"));
    }

    @PutMapping("/hr-profile")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    @Operation(summary = "Update HR recruiter profile", description = "Updates company name, website, description, department, and designation")
    public ResponseEntity<ApiResponse<HRProfileDto>> updateHRProfile(
            Authentication authentication,
            @RequestBody HRProfileDto dto) {
        Long userId = getUserIdFromAuth(authentication);
        HRProfileDto updated = userService.updateHRProfile(userId, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "HR profile updated successfully"));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change password", description = "Verifies current password and updates with new BCrypt hashed password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        Long userId = getUserIdFromAuth(authentication);
        userService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", "Password updated"));
    }
}
