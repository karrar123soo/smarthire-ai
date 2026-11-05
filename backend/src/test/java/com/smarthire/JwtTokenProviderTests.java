package com.smarthire;

import com.smarthire.config.JwtTokenProvider;
import com.smarthire.model.entity.User;
import com.smarthire.model.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTests {

    private JwtTokenProvider tokenProvider;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationMs", 3600000L); // 1 hour
    }

    @Test
    void testGenerateAndValidateToken() {
        User user = User.builder()
                .id(100L)
                .email("test.jwt@smarthire.ai")
                .fullName("Test JWT User")
                .role(Role.ROLE_CANDIDATE)
                .active(true)
                .build();

        String token = tokenProvider.generateToken(user);
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals("test.jwt@smarthire.ai", tokenProvider.getEmailFromToken(token));
    }

    @Test
    void testInvalidTokenValidation() {
        String invalidToken = "eyJhbGciOiJIUzM4NCJ9.invalidpayload.invalidsignature";
        assertFalse(tokenProvider.validateToken(invalidToken));
    }

    @Test
    void testUrlSafeBase64SecretWithHyphensAndUnderscores() {
        JwtTokenProvider urlSafeProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(urlSafeProvider, "jwtSecret", "dBj-rphAPOY7pg92AN0c9MN4yecczLMdwnx4OkA1K_Uk=");
        ReflectionTestUtils.setField(urlSafeProvider, "jwtExpirationMs", 3600000L);

        User user = User.builder()
                .id(101L)
                .email("candidate@smarthire.ai")
                .fullName("Demo Candidate")
                .role(Role.ROLE_CANDIDATE)
                .active(true)
                .build();

        String token = urlSafeProvider.generateToken(user);
        assertNotNull(token);
        assertTrue(urlSafeProvider.validateToken(token));
        assertEquals("candidate@smarthire.ai", urlSafeProvider.getEmailFromToken(token));
    }

    @Test
    void testRawPassphraseWithHyphens() {
        JwtTokenProvider rawSecretProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(rawSecretProvider, "jwtSecret", "this-is-a-super-secure-production-jwt-secret-phrase-at-least-256-bits");
        ReflectionTestUtils.setField(rawSecretProvider, "jwtExpirationMs", 3600000L);

        User user = User.builder()
                .id(102L)
                .email("hr@smarthire.ai")
                .fullName("Demo HR")
                .role(Role.ROLE_HR)
                .active(true)
                .build();

        String token = rawSecretProvider.generateToken(user);
        assertNotNull(token);
        assertTrue(rawSecretProvider.validateToken(token));
        assertEquals("hr@smarthire.ai", rawSecretProvider.getEmailFromToken(token));
    }
}
