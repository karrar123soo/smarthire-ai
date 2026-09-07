package com.smarthire;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthire.config.JwtTokenProvider;
import com.smarthire.model.dto.resume.ParsedSkillSyncRequest;
import com.smarthire.model.entity.Resume;
import com.smarthire.model.entity.User;
import com.smarthire.repository.ResumeRepository;
import com.smarthire.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ResumeControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    private String candidateToken;
    private String hrToken;
    private User candidateUser;

    @BeforeEach
    void setUp() {
        candidateUser = userRepository.findByEmail("candidate@smarthire.ai").orElseThrow();
        candidateToken = jwtTokenProvider.generateToken(candidateUser);

        User hrUser = userRepository.findByEmail("hr@smarthire.ai").orElseThrow();
        hrToken = jwtTokenProvider.generateToken(hrUser);
    }

    @Test
    @DisplayName("Should allow candidate to upload and parse resume text with skill scanner")
    void testUploadAndParseResume() throws Exception {
        String resumeContent = "John Doe\nExperienced Full-Stack Developer with 6 years experience in Java, Spring Boot, React, MySQL, and Docker.";
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "john_doe_resume.txt",
                "text/plain",
                resumeContent.getBytes()
        );

        mockMvc.perform(multipart("/api/v1/resumes/upload")
                        .file(file)
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.fileName", is("john_doe_resume.txt")))
                .andExpect(jsonPath("$.data.extractedSkills", hasItems("Java", "Spring Boot", "React", "MySQL", "Docker")))
                .andExpect(jsonPath("$.data.extractedYearsOfExperience", is(6)));
    }

    @Test
    @DisplayName("Should retrieve candidate's list of uploaded resumes")
    void testGetMyResumes() throws Exception {
        mockMvc.perform(get("/api/v1/resumes/my-resumes")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", not(empty())));
    }

    @Test
    @DisplayName("Should allow candidate to synchronize parsed resume to Candidate Profile")
    void testSyncResumeToProfile() throws Exception {
        Resume resume = resumeRepository.findAll().get(0);

        ParsedSkillSyncRequest syncReq = ParsedSkillSyncRequest.builder()
                .headline("Lead Cloud & Java Architect")
                .summary("Demonstrated expertise architecting high-throughput microservices.")
                .yearsOfExperience(7)
                .education("M.S. in Computer Science")
                .location("San Francisco, CA")
                .skills(List.of("Java", "Spring Boot", "AWS", "Kubernetes", "Docker"))
                .build();

        mockMvc.perform(post("/api/v1/resumes/" + resume.getId() + "/sync-profile")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(syncReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.extractedYearsOfExperience", is(7)));
    }
}
