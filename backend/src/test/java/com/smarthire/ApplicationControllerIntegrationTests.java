package com.smarthire;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthire.config.JwtTokenProvider;
import com.smarthire.model.dto.application.ApplyJobRequest;
import com.smarthire.model.dto.application.UpdateApplicationStatusRequest;
import com.smarthire.model.entity.Application;
import com.smarthire.model.entity.Job;
import com.smarthire.model.entity.User;
import com.smarthire.model.enums.ApplicationStatus;
import com.smarthire.model.enums.JobStatus;
import com.smarthire.repository.ApplicationRepository;
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
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ApplicationControllerIntegrationTests {

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

    @Autowired
    private ApplicationRepository applicationRepository;

    private String hrToken;
    private String candidateToken;
    private User candidateUser;
    private User hrUser;

    @BeforeEach
    void setUp() {
        hrUser = userRepository.findByEmail("hr@smarthire.ai").orElseThrow();
        hrToken = jwtTokenProvider.generateToken(hrUser);

        candidateUser = userRepository.findByEmail("candidate@smarthire.ai").orElseThrow();
        candidateToken = jwtTokenProvider.generateToken(candidateUser);
    }

    @Test
    @DisplayName("Should allow candidate to submit a job application with skill match computation")
    void testCandidateApplyToJob() throws Exception {
        Job targetJob = jobRepository.findAll().stream()
                .filter(j -> j.getStatus() == JobStatus.OPEN && !applicationRepository.existsByJobIdAndCandidateId(j.getId(), candidateUser.getId()))
                .findFirst()
                .orElse(null);

        if (targetJob == null) {
            targetJob = jobRepository.findAll().get(0);
            targetJob.setStatus(JobStatus.OPEN);
            jobRepository.save(targetJob);
            applicationRepository.findByJobIdAndCandidateId(targetJob.getId(), candidateUser.getId())
                    .ifPresent(applicationRepository::delete);
        }

        ApplyJobRequest request = ApplyJobRequest.builder()
                .jobId(targetJob.getId())
                .candidateNotes("Excited to apply with deep expertise in cloud architectures.")
                .build();

        mockMvc.perform(post("/api/v1/applications/apply")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.jobId", is(targetJob.getId().intValue())))
                .andExpect(jsonPath("$.data.status", is("APPLIED")))
                .andExpect(jsonPath("$.data.matchScore", notNullValue()));
    }

    @Test
    @DisplayName("Should reject duplicate application to same job with 400 Bad Request")
    void testDuplicateApplicationRejection() throws Exception {
        // First ensure candidate applied to a job
        Job job = jobRepository.findAll().get(0);
        job.setStatus(JobStatus.OPEN);
        jobRepository.save(job);

        if (!applicationRepository.existsByJobIdAndCandidateId(job.getId(), candidateUser.getId())) {
            Application app = Application.builder()
                    .job(job)
                    .candidate(candidateUser)
                    .status(ApplicationStatus.APPLIED)
                    .matchScore(80.0)
                    .build();
            applicationRepository.save(app);
        }

        ApplyJobRequest duplicateRequest = ApplyJobRequest.builder()
                .jobId(job.getId())
                .candidateNotes("Duplicate submission attempt.")
                .build();

        mockMvc.perform(post("/api/v1/applications/apply")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already submitted")));
    }

    @Test
    @DisplayName("Should retrieve candidate's own submitted applications")
    void testGetMyApplications() throws Exception {
        mockMvc.perform(get("/api/v1/applications/my-applications")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", not(empty())));
    }

    @Test
    @DisplayName("Should allow recruiter to view candidates for their job requisition")
    void testGetJobApplications() throws Exception {
        Job job = jobRepository.findAll().get(0);

        mockMvc.perform(get("/api/v1/applications/job/" + job.getId())
                        .header("Authorization", "Bearer " + hrToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", notNullValue()));
    }

    @Test
    @DisplayName("Should allow recruiter to view candidate pipeline across all their jobs")
    void testGetRecruiterPipeline() throws Exception {
        mockMvc.perform(get("/api/v1/applications/recruiter-pipeline")
                        .header("Authorization", "Bearer " + hrToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", not(empty())));
    }

    @Test
    @DisplayName("Should allow recruiter to advance candidate stage to SHORTLISTED with notes")
    void testUpdateApplicationStatus() throws Exception {
        Application app = applicationRepository.findAll().get(0);

        UpdateApplicationStatusRequest request = UpdateApplicationStatusRequest.builder()
                .status(ApplicationStatus.SHORTLISTED)
                .hrNotes("Candidate cleared initial screening. Ready for technical round.")
                .build();

        mockMvc.perform(patch("/api/v1/applications/" + app.getId() + "/status")
                        .header("Authorization", "Bearer " + hrToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("SHORTLISTED")))
                .andExpect(jsonPath("$.data.hrNotes", containsString("cleared initial screening")));
    }

    @Test
    @DisplayName("Should forbid candidate from updating application status (403 Forbidden)")
    void testCandidateForbiddenFromUpdatingStatus() throws Exception {
        Application app = applicationRepository.findAll().get(0);

        UpdateApplicationStatusRequest request = UpdateApplicationStatusRequest.builder()
                .status(ApplicationStatus.HIRED)
                .build();

        mockMvc.perform(patch("/api/v1/applications/" + app.getId() + "/status")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("Should retrieve recruiter pipeline funnel statistics")
    void testGetPipelineStats() throws Exception {
        mockMvc.perform(get("/api/v1/applications/stats")
                        .header("Authorization", "Bearer " + hrToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalApplications", greaterThanOrEqualTo(1)));
    }
}
