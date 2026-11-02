package com.devspectrabackend.service;

import com.devspectrabackend.dto.AuthResponse;
import com.devspectrabackend.dto.LoginRequest;
import com.devspectrabackend.model.User;
import com.devspectrabackend.repository.UserRepository;
import com.devspectrabackend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        // Validasi domain email saat login
        if (!loginRequest.getEmail().toLowerCase().endsWith("@devspectra.com")) {
            throw new RuntimeException("Akses Ditolak: Hanya anggota internal DevSpectra (@devspectra.com) yang dapat masuk.");
        }

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Email atau password salah."));

        // Verifikasi password yang di-hash dengan BCrypt
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email atau password salah.");
        }

        // Generate JWT Token
        String token = tokenProvider.generateToken(user.getEmail());

        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole(), user.getDivision());
    }
}