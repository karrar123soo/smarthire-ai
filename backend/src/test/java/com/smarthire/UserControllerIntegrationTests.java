package com.smarthire;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthire.config.JwtTokenProvider;
import com.smarthire.model.dto.auth.ChangePasswordRequest;
import com.smarthire.model.dto.user.CandidateProfileDto;
import com.smarthire.model.dto.user.HRProfileDto;
import com.smarthire.model.entity.User;
import com.smarthire.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    private String candidateToken;
    private String hrToken;

    @BeforeEach
    void setUp() {
        User candidate = userRepository.findByEmail("candidate@smarthire.ai").orElseThrow();
        candidateToken = jwtTokenProvider.generateToken(candidate);

        User hr = userRepository.findByEmail("hr@smarthire.ai").orElseThrow();
        hrToken = jwtTokenProvider.generateToken(hr);
    }

    @Test
    @DisplayName("Should reject unauthenticated access to /api/v1/users/profile with 401 Unauthorized")
    void testUnauthenticatedProfileAccess() throws Exception {
        mockMvc.perform(get("/api/v1/users/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")));
    }

    @Test
    @DisplayName("Should retrieve full user profile with valid Bearer token")
    void testGetProfileWithAuth() throws Exception {
        mockMvc.perform(get("/api/v1/users/profile")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is("candidate@smarthire.ai")))
                .andExpect(jsonPath("$.data.role", is("ROLE_CANDIDATE")))
                .andExpect(jsonPath("$.data.candidateProfile", notNullValue()));
    }

    @Test
    @DisplayName("Should update candidate profile and skills")
    void testUpdateCandidateProfile() throws Exception {
        CandidateProfileDto updateDto = CandidateProfileDto.builder()
                .fullName("Alex Morgan Updated")
                .headline("Principal Architect")
                .yearsOfExperience(7)
                .location("San Francisco, CA")
                .skills(List.of("Java", "Spring Boot", "React", "AWS", "Microservices", "Docker"))
                .build();

        mockMvc.perform(put("/api/v1/users/candidate-profile")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.headline", is("Principal Architect")))
                .andExpect(jsonPath("$.data.yearsOfExperience", is(7)))
                .andExpect(jsonPath("$.data.skills", hasItem("Microservices")));
    }

    @Test
    @DisplayName("Should retrieve HR profile for HR recruiter")
    void testGetHRProfile() throws Exception {
        mockMvc.perform(get("/api/v1/users/hr-profile")
                        .header("Authorization", "Bearer " + hrToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.companyName", startsWith("TechNova")));
    }

    @Test
    @DisplayName("Should update HR recruiter organization profile")
    void testUpdateHRProfile() throws Exception {
        HRProfileDto hrDto = HRProfileDto.builder()
                .companyName("TechNova Global")
                .companyWebsite("https://technova.global")
                .department("Executive Talent Acquisition")
                .designation("Director of Talent")
                .build();

        mockMvc.perform(put("/api/v1/users/hr-profile")
                        .header("Authorization", "Bearer " + hrToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hrDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.companyName", is("TechNova Global")))
                .andExpect(jsonPath("$.data.designation", is("Director of Talent")));
    }

    @Test
    @DisplayName("Should forbid Candidate from accessing HR-only endpoint with 403 Forbidden")
    void testCandidateForbiddenFromHREndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/users/hr-profile")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)))
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("Should reject password change with incorrect current password")
    void testChangePasswordWithWrongCurrent() throws Exception {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("wrongCurrentPassword")
                .newPassword("brandNewPassword123")
                .build();

        mockMvc.perform(put("/api/v1/users/change-password")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Current password does not match")));
    }
}
