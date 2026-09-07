package com.smarthire;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthire.config.JwtTokenProvider;
import com.smarthire.model.dto.interview.InterviewFeedbackRequest;
import com.smarthire.model.dto.interview.ScheduleInterviewRequest;
import com.smarthire.model.entity.Application;
import com.smarthire.model.entity.Interview;
import com.smarthire.model.entity.User;
import com.smarthire.model.enums.ApplicationStatus;
import com.smarthire.model.enums.InterviewStatus;
import com.smarthire.model.enums.InterviewType;
import com.smarthire.repository.ApplicationRepository;
import com.smarthire.repository.InterviewRepository;
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

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class InterviewControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    private String hrToken;
    private String candidateToken;
    private User hrUser;

    @BeforeEach
    void setUp() {
        hrUser = userRepository.findByEmail("hr@smarthire.ai").orElseThrow();
        hrToken = jwtTokenProvider.generateToken(hrUser);

        User candidateUser = userRepository.findByEmail("candidate@smarthire.ai").orElseThrow();
        candidateToken = jwtTokenProvider.generateToken(candidateUser);
    }

    @Test
    @DisplayName("Should allow recruiter to schedule candidate interview with meeting link")
    void testScheduleInterview() throws Exception {
        Application app = applicationRepository.findAll().stream()
                .filter(a -> a.getJob().getPostedBy().getId().equals(hrUser.getId()))
                .findFirst()
                .orElseThrow();

        // Ensure status is eligible for scheduling
        app.setStatus(ApplicationStatus.SHORTLISTED);
        app = applicationRepository.save(app);

        ScheduleInterviewRequest request = ScheduleInterviewRequest.builder()
                .applicationId(app.getId())
                .interviewDateTime(LocalDateTime.now().plusDays(3).withHour(15).withMinute(0))
                .durationMinutes(60)
                .interviewType(InterviewType.TECHNICAL)
                .meetingLink("https://meet.google.com/smh-system-arch")
                .customNotes("Focus on distributed caching and JPA concurrency.")
                .build();

        mockMvc.perform(post("/api/v1/interviews/schedule")
                        .header("Authorization", "Bearer " + hrToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.interviewType", is("TECHNICAL")))
                .andExpect(jsonPath("$.data.meetingLink", containsString("meet.google.com")))
                .andExpect(jsonPath("$.data.currentApplicationStatus", is("INTERVIEW_SCHEDULED")));
    }

    @Test
    @DisplayName("Should allow candidate to view their scheduled interviews")
    void testCandidateGetMyInterviews() throws Exception {
        mockMvc.perform(get("/api/v1/interviews/my-interviews")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", notNullValue()));
    }

    @Test
    @DisplayName("Should allow recruiter to submit interview feedback scorecard and advance to HIRED")
    void testSubmitInterviewFeedback() throws Exception {
        Interview interview = interviewRepository.findAll().stream()
                .filter(i -> i.getApplication().getJob().getPostedBy().getId().equals(hrUser.getId()))
                .findFirst()
                .orElseGet(() -> {
                    Application a = applicationRepository.findAll().stream()
                            .filter(app -> app.getJob().getPostedBy().getId().equals(hrUser.getId()))
                            .findFirst()
                            .orElseThrow();
                    Interview newInt = Interview.builder()
                            .application(a)
                            .interviewer(hrUser)
                            .interviewDateTime(LocalDateTime.now().plusDays(2))
                            .durationMinutes(45)
                            .interviewType(InterviewType.TECHNICAL)
                            .status(InterviewStatus.SCHEDULED)
                            .build();
                    return interviewRepository.save(newInt);
                });

        InterviewFeedbackRequest feedbackReq = InterviewFeedbackRequest.builder()
                .rating(9)
                .feedback("Superb microservice architectural depth and excellent communication.")
                .technicalScore(9)
                .problemSolvingScore(9)
                .advanceApplicationStatus(ApplicationStatus.HIRED)
                .build();

        mockMvc.perform(post("/api/v1/interviews/" + interview.getId() + "/feedback")
                        .header("Authorization", "Bearer " + hrToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(feedbackReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.rating", is(9)))
                .andExpect(jsonPath("$.data.status", is("COMPLETED")));
    }

    @Test
    @DisplayName("Should forbid candidate from scheduling an interview (403 Forbidden)")
    void testCandidateForbiddenFromScheduling() throws Exception {
        ScheduleInterviewRequest request = ScheduleInterviewRequest.builder()
                .applicationId(1L)
                .interviewDateTime(LocalDateTime.now().plusDays(2))
                .build();

        mockMvc.perform(post("/api/v1/interviews/schedule")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }
}
