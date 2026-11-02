package com.devspectrabackend.service;

import com.devspectrabackend.dto.AuthResponse;
import com.devspectrabackend.dto.LoginRequest;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
}