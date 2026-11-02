package com.devspectrabackend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "testimonials")
public class Testimonial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clientName;
    private String company;

    // Memetakan 'content' dari JSON ke kolom 'message' di database
    @Column(name = "message", columnDefinition = "TEXT")
    private String content;

    private Integer rating;
    private Boolean isActive = true;

    // true = penilaian pengunjung dari halaman Contact website (VisitorReviewService),
    // kosong/false = ditambahkan tim lewat dashboard. Tidak bisa diisi dari luar.
    @Column(name = "from_website")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Boolean fromWebsite;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}