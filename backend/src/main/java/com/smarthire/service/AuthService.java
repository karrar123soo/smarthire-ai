package com.smarthire.service;

import com.smarthire.model.dto.auth.AuthResponse;
import com.smarthire.model.dto.auth.LoginRequest;
import com.smarthire.model.dto.auth.RegisterRequest;
import com.smarthire.model.dto.user.UserDto;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserDto getCurrentUser(String email);
}
