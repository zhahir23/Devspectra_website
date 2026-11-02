package com.devspectrabackend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Mengaktifkan CORS agar bisa diakses dari Frontend (React / Next.js)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. Endpoint Autentikasi, Error Handler, & Dokumentasi Swagger (Publik)
                        .requestMatchers("/api/auth/**", "/error", "/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                        // 2. Endpoint POST Publik: Pengiriman Form Kontak Klien dan penilaian pengunjung
                        //    (akun anggota baru hanya dibuat pemegang keuangan lewat dashboard, jadi /api/users wajib login)
                        .requestMatchers(HttpMethod.POST, "/api/inquiries").permitAll()
                        //    + penilaian pengunjung dari halaman Contact (TestimonialController: bintang 1-2 disembunyikan)
                        .requestMatchers(HttpMethod.POST, "/api/testimonials").permitAll()

                        // 3. Endpoint GET Publik: Artikel, Layanan, Testimoni, Halaman, Pengaturan, & Daftar Tim
                        //    + Projects, anggota tim di website, gambar yang diunggah dari dashboard,
                        //    dan status pembayaran QRIS (/api/orders/{orderId}, tanpa data pesan).
                        //    Tambah/ubah/hapus Projects dan anggota tim tetap wajib login (aturan nomor 4).
                        .requestMatchers(HttpMethod.GET,
                                "/api/articles/**",
                                "/api/services/**",
                                "/api/testimonials/**",
                                "/api/pages/**",
                                "/api/settings/**",
                                "/api/users/**",
                                "/api/projects/**",
                                "/api/team-members/**",
                                "/api/media/**",
                                "/api/orders/**"
                        ).permitAll()

                        // 4. Seluruh endpoint lainnya wajib menggunakan Token JWT
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Mengizinkan akses dari port frontend lokal (React/Next.js/Vite) maupun domain produksi
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);
        // Browser cukup menanyakan izin CORS (permintaan OPTIONS) sekali per jam per alamat,
        // bukan sebelum hampir setiap permintaan (bawaan Chrome hanya mengingatnya 5 detik)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}