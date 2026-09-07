package com.smarthire;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthire.config.JwtTokenProvider;
import com.smarthire.model.entity.Notification;
import com.smarthire.model.entity.User;
import com.smarthire.repository.NotificationRepository;
import com.smarthire.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AnalyticsNotificationIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private String hrToken;
    private String candidateToken;
    private User candidateUser;

    @BeforeEach
    void setUp() {
        User hrUser = userRepository.findByEmail("hr@smarthire.ai").orElseThrow();
        hrToken = jwtTokenProvider.generateToken(hrUser);

        candidateUser = userRepository.findByEmail("candidate@smarthire.ai").orElseThrow();
        candidateToken = jwtTokenProvider.generateToken(candidateUser);
    }

    @Test
    @DisplayName("Should retrieve candidate's notification list")
    void testGetNotifications() throws Exception {
        mockMvc.perform(get("/api/v1/notifications")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", notNullValue()));
    }

    @Test
    @DisplayName("Should retrieve unread notification count")
    void testGetUnreadNotificationCount() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/unread-count")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.unreadCount", notNullValue()));
    }

    @Test
    @DisplayName("Should mark single notification as read")
    void testMarkNotificationAsRead() throws Exception {
        Notification notif = notificationRepository.findAll().stream()
                .filter(n -> n.getRecipient().getId().equals(candidateUser.getId()))
                .findFirst()
                .orElse(null);

        if (notif != null) {
            mockMvc.perform(patch("/api/v1/notifications/" + notif.getId() + "/read")
                            .header("Authorization", "Bearer " + candidateToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.read", is(true)));
        }
    }

    @Test
    @DisplayName("Should allow recruiter to retrieve analytics dashboard KPIs and funnel")
    void testGetRecruiterAnalytics() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/dashboard")
                        .header("Authorization", "Bearer " + hrToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalJobs", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.funnel", notNullValue()))
                .andExpect(jsonPath("$.data.topInDemandSkills", notNullValue()));
    }

    @Test
    @DisplayName("Should forbid candidate from accessing recruiter analytics dashboard (403 Forbidden)")
    void testCandidateForbiddenFromAnalytics() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/dashboard")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }
}
