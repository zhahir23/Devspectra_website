package com.devspectrabackend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {
    // Kunci rahasia tetap (minimal 32 karakter) agar tidak berubah saat aplikasi restart
    private final String jwtSecretString = "devspectra_super_secret_key_jwt_security_2026_backend_devspectra";
    private final SecretKey jwtSecret = Keys.hmacShaKeyFor(jwtSecretString.getBytes(StandardCharsets.UTF_8));
    private final long jwtExpirationInMs = 86400000; // Berlaku 24 jam

    public String generateToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(jwtSecret)
                .compact();
    }

    public String getEmailFromJWT(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(jwtSecret)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(jwtSecret)
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}