package com.smarthire;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthire.config.JwtTokenProvider;
import com.smarthire.model.dto.job.CreateJobRequest;
import com.smarthire.model.dto.job.UpdateJobRequest;
import com.smarthire.model.entity.Job;
import com.smarthire.model.entity.User;
import com.smarthire.model.enums.JobStatus;
import com.smarthire.model.enums.JobType;
import com.smarthire.repository.JobRepository;
import com.smarthire.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class JobControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    private String hrToken;
    private String candidateToken;

    @BeforeEach
    void setUp() {
        User hr = userRepository.findByEmail("hr@smarthire.ai").orElseThrow();
        hrToken = jwtTokenProvider.generateToken(hr);

        User candidate = userRepository.findByEmail("candidate@smarthire.ai").orElseThrow();
        candidateToken = jwtTokenProvider.generateToken(candidate);
    }

    @Test
    @DisplayName("Should publicly retrieve paginated open jobs without authentication")
    void testPublicBrowseJobs() throws Exception {
        mockMvc.perform(get("/api/v1/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", not(empty())))
                .andExpect(jsonPath("$.data.totalElements", greaterThanOrEqualTo(1)));
    }

    @Test
    @DisplayName("Should filter jobs by search keyword (e.g. Java)")
    void testFilterJobsByKeyword() throws Exception {
        mockMvc.perform(get("/api/v1/jobs")
                        .param("keyword", "Java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", not(empty())))
                .andExpect(jsonPath("$.data.content[0].title", containsStringIgnoringCase("Java")));
    }

    @Test
    @DisplayName("Should filter jobs by jobType (e.g. CONTRACT)")
    void testFilterJobsByType() throws Exception {
        mockMvc.perform(get("/api/v1/jobs")
                        .param("jobType", "CONTRACT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content[0].jobType", is("CONTRACT")));
    }

    @Test
    @DisplayName("Should retrieve complete job details by ID")
    void testGetJobById() throws Exception {
        Job sampleJob = jobRepository.findAll().get(0);

        mockMvc.perform(get("/api/v1/jobs/" + sampleJob.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(sampleJob.getId().intValue())))
                .andExpect(jsonPath("$.data.title", is(sampleJob.getTitle())))
                .andExpect(jsonPath("$.data.companyName", notNullValue()));
    }

    @Test
    @DisplayName("Should allow HR recruiter to create a new job requisition")
    void testHRCreateJob() throws Exception {
        CreateJobRequest request = CreateJobRequest.builder()
                .title("Staff Reliability & Security Architect")
                .description("Lead platform resilience, automated failover systems, and zero-trust authentication.")
                .department("Security Engineering")
                .location("San Francisco, CA (Remote)")
                .jobType(JobType.FULL_TIME)
                .experienceYearsRequired(7)
                .minSalary(new BigDecimal("160000"))
                .maxSalary(new BigDecimal("200000"))
                .status(JobStatus.OPEN)
                .requiredSkills(List.of("AWS", "Docker", "Kubernetes", "CI/CD Pipelines", "Microservices"))
                .build();

        mockMvc.perform(post("/api/v1/jobs")
                        .header("Authorization", "Bearer " + hrToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.title", is("Staff Reliability & Security Architect")))
                .andExpect(jsonPath("$.data.requiredSkills", hasSize(5)));
    }

    @Test
    @DisplayName("Should forbid Candidate from posting a job requisition (403 Forbidden)")
    void testCandidateForbiddenFromPostingJob() throws Exception {
        CreateJobRequest request = CreateJobRequest.builder()
                .title("Unauthorized Candidate Job")
                .description("This should be rejected.")
                .jobType(JobType.FULL_TIME)
                .build();

        mockMvc.perform(post("/api/v1/jobs")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("Should allow HR to update their own job requisition")
    void testHRUpdateJob() throws Exception {
        Job job = jobRepository.findAll().get(0);

        UpdateJobRequest updateRequest = UpdateJobRequest.builder()
                .title("Senior Cloud Architect (Updated)")
                .description(job.getDescription())
                .department(job.getDepartment())
                .location("Hybrid - San Francisco, CA")
                .jobType(job.getJobType())
                .experienceYearsRequired(5)
                .minSalary(new BigDecimal("140000"))
                .maxSalary(new BigDecimal("175000"))
                .status(JobStatus.OPEN)
                .requiredSkills(List.of("Java", "Spring Boot", "MySQL", "AWS"))
                .build();

        mockMvc.perform(put("/api/v1/jobs/" + job.getId())
                        .header("Authorization", "Bearer " + hrToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.title", containsString("(Updated)")))
                .andExpect(jsonPath("$.data.location", is("Hybrid - San Francisco, CA")));
    }

    @Test
    @DisplayName("Should allow HR to change job status via PATCH")
    void testHRChangeJobStatus() throws Exception {
        Job job = jobRepository.findAll().get(0);

        mockMvc.perform(patch("/api/v1/jobs/" + job.getId() + "/status")
                        .header("Authorization", "Bearer " + hrToken)
                        .param("status", "CLOSED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("CLOSED")));
    }

    @Test
    @DisplayName("Should retrieve HR recruiter's own jobs list")
    void testGetMyJobs() throws Exception {
        mockMvc.perform(get("/api/v1/jobs/my-jobs")
                        .header("Authorization", "Bearer " + hrToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", not(empty())));
    }

    @Test
    @DisplayName("Should retrieve HR recruiter job statistics")
    void testGetJobStats() throws Exception {
        mockMvc.perform(get("/api/v1/jobs/stats")
                        .header("Authorization", "Bearer " + hrToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalJobs", greaterThanOrEqualTo(1)));
    }
}
