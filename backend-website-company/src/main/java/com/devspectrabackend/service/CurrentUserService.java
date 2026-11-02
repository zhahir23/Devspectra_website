package com.devspectrabackend.service;

import com.devspectrabackend.model.User;
import com.devspectrabackend.repository.UserRepository;
import com.devspectrabackend.support.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/** Mencari anggota yang sedang login dari email di token JWT (diisi JwtAuthenticationFilter). */
@Service
public class CurrentUserService {

    @Autowired
    private UserRepository userRepository;

    public User require() {
        if (!isLoggedIn()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Silakan login lagi.");
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED,
                        "Akun kamu tidak ditemukan. Silakan login lagi."));
    }

    /**
     * true kalau permintaan ini membawa token login anggota yang sah.
     * Dipakai endpoint publik yang menampilkan lebih banyak data untuk dashboard,
     * misalnya project yang disembunyikan.
     */
    public boolean isLoggedIn() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken);
    }
}
