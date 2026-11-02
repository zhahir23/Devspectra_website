package com.devspectrabackend.controller;

import com.devspectrabackend.model.User;
import com.devspectrabackend.repository.UserRepository;
import com.devspectrabackend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String LOGIN_FAILED = "Email atau password salah.";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            if (email == null || password == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Email dan password wajib diisi"));
            }

            // Cari semua user dengan email tersebut (diurutkan dari ID terbaru agar tidak error jika ada duplikat)
            List<User> matchingUsers = userRepository.findAll().stream()
                    .filter(u -> u.getEmail() != null && u.getEmail().trim().equalsIgnoreCase(email.trim()))
                    .sorted(Comparator.comparing(User::getId).reversed())
                    .toList();

            // Pesan yang sama untuk email tidak terdaftar dan password salah, supaya halaman login
            // tidak bisa dipakai untuk menebak email anggota mana yang terdaftar.
            if (matchingUsers.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", LOGIN_FAILED));
            }

            // Cek kecocokan password pada akun yang ditemukan (BCrypt; teks biasa hanya untuk akun lama, lihat passwordMatches)
            User authenticatedUser = null;
            for (User u : matchingUsers) {
                if (passwordMatches(u, password)) {
                    authenticatedUser = u;
                    break;
                }
            }

            if (authenticatedUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", LOGIN_FAILED));
            }

            // Buat Token JWT
            String token = tokenProvider.generateToken(authenticatedUser.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("type", "Bearer");
            response.put("email", authenticatedUser.getEmail());
            response.put("name", authenticatedUser.getName());
            response.put("role", authenticatedUser.getRole());
            response.put("division", authenticatedUser.getDivision());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Terjadi kesalahan saat login: " + e.getMessage()));
        }
    }

    /**
     * Password yang tersimpan sebagai hash BCrypt hanya dicocokkan lewat passwordEncoder.
     * Dulu hash-nya sendiri juga diterima sebagai password, padahal hash itu bisa dibaca
     * siapa saja lewat GET /api/users, jadi orang bisa login sebagai anggota mana pun.
     * Akun lama yang password-nya masih teks biasa tetap bisa masuk, lalu langsung diubah menjadi hash.
     */
    private boolean passwordMatches(User user, String password) {
        String stored = user.getPassword();
        if (stored == null) {
            return false;
        }
        if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
            return passwordEncoder.matches(password, stored);
        }
        if (!password.equals(stored)) {
            return false;
        }
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
        return true;
    }
}