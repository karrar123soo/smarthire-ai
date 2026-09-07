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
}
