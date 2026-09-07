package com.smarthire.model.dto.auth;

import com.smarthire.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long expiresIn;

    // User details
    private Long userId;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Role role;

    // Additional profile context if available
    private String headlineOrCompany;
    private List<String> skills;
}
