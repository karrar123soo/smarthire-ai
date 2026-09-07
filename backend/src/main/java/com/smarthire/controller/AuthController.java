package com.smarthire.controller;

import com.smarthire.model.dto.ApiResponse;
import com.smarthire.model.dto.auth.AuthResponse;
import com.smarthire.model.dto.auth.LoginRequest;
import com.smarthire.model.dto.auth.RegisterRequest;
import com.smarthire.model.dto.user.UserDto;
import com.smarthire.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & Authorization", description = "Registration, login, JWT token issuance, and current session verification")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Registers a Candidate or HR Recruiter, encrypts password, automatically initializes role profile, and issues JWT access token")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(ApiResponse.success(response, "Registration successful"), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Verifies user credentials, validates account status, and issues JWT access token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user", description = "Returns identity and profile information of the currently authenticated user token", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return new ResponseEntity<>(ApiResponse.error("Unauthenticated"), HttpStatus.UNAUTHORIZED);
        }
        UserDto userDto = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(userDto, "User profile retrieved successfully"));
    }
}
