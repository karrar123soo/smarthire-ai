package com.smarthire;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthire.model.dto.auth.LoginRequest;
import com.smarthire.model.dto.auth.RegisterRequest;
import com.smarthire.model.enums.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should successfully login with pre-seeded HR recruiter account")
    void testHRLoginSuccess() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("hr@smarthire.ai")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.email", is("hr@smarthire.ai")))
                .andExpect(jsonPath("$.data.role", is("ROLE_HR")))
                .andExpect(jsonPath("$.data.headlineOrCompany", startsWith("TechNova")));
    }

    @Test
    @DisplayName("Should successfully login with pre-seeded Candidate account")
    void testCandidateLoginSuccess() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("candidate@smarthire.ai")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.email", is("candidate@smarthire.ai")))
                .andExpect(jsonPath("$.data.role", is("ROLE_CANDIDATE")))
                .andExpect(jsonPath("$.data.skills", not(empty())));
    }

    @Test
    @DisplayName("Should register a new Candidate and return JWT token")
    void testCandidateRegistration() throws Exception {
        String uniqueEmail = "cand.test." + System.currentTimeMillis() + "@smarthire.ai";
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email(uniqueEmail)
                .password("securePass123")
                .fullName("Taylor Candidate")
                .phoneNumber("+1-555-8888")
                .role(Role.ROLE_CANDIDATE)
                .headline("Full Stack Cloud Developer")
                .yearsOfExperience(4)
                .location("Seattle, WA")
                .skills(List.of("Java", "Spring Boot", "React", "Docker"))
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.email", is(uniqueEmail.toLowerCase())))
                .andExpect(jsonPath("$.data.role", is("ROLE_CANDIDATE")))
                .andExpect(jsonPath("$.data.skills", hasSize(4)));
    }

    @Test
    @DisplayName("Should register a new HR Recruiter and return JWT token")
    void testHRRegistration() throws Exception {
        String uniqueEmail = "hr.test." + System.currentTimeMillis() + "@smarthire.ai";
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email(uniqueEmail)
                .password("securePass123")
                .fullName("Morgan Recruiter")
                .phoneNumber("+1-555-9999")
                .role(Role.ROLE_HR)
                .companyName("CloudScale Inc")
                .companyWebsite("https://cloudscale.example.com")
                .department("Talent Acquisition")
                .designation("Head of Talent")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.email", is(uniqueEmail.toLowerCase())))
                .andExpect(jsonPath("$.data.role", is("ROLE_HR")))
                .andExpect(jsonPath("$.data.headlineOrCompany", is("CloudScale Inc")));
    }

    @Test
    @DisplayName("Should reject duplicate email registration with 400 Bad Request")
    void testDuplicateEmailRegistration() throws Exception {
        RegisterRequest duplicateRequest = RegisterRequest.builder()
                .email("hr@smarthire.ai") // already exists
                .password("password123")
                .fullName("Duplicate User")
                .role(Role.ROLE_HR)
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("already registered")));
    }

    @Test
    @DisplayName("Should reject login with invalid password")
    void testLoginWithBadCredentials() throws Exception {
        LoginRequest badLogin = LoginRequest.builder()
                .email("hr@smarthire.ai")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.success", is(false)));
    }
}
