package com.smarthire.model.dto.auth;

import com.smarthire.model.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;

    private String phoneNumber;

    @NotNull(message = "Role is required (ROLE_CANDIDATE or ROLE_HR)")
    private Role role;

    // Optional initial profile fields for Candidate
    private String headline;
    private Integer yearsOfExperience;
    private String location;
    private List<String> skills;

    // Optional initial profile fields for HR
    private String companyName;
    private String companyWebsite;
    private String department;
    private String designation;
}
