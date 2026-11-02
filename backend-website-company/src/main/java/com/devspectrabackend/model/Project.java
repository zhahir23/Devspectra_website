package com.devspectrabackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Project yang tampil di halaman Projects website company.
 * Dikelola dari dashboard admin (Konten website > Projects), lewat ProjectService.
 */
@Entity
@Table(name = "website_projects")
@Data
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // "IT" atau "Media", sama dengan pilihan di menu Projects di website
    @Column(nullable = false, length = 30)
    private String category;

    // "active" = label kategori di kartu berwarna hijau, "archived" = abu-abu
    @Column(nullable = false, length = 20)
    private String status = "active";

    // Dipisah koma, misalnya "UI/UX, Mobile, Figma"
    @Column(columnDefinition = "TEXT")
    private String tags;

    // "/projects/braka.png" = file di folder public website,
    // "/api/media/12" = gambar yang diunggah dari dashboard (tabel website_media)
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    // Tujuan tombol "Lihat di Canva" di kartu project
    @Column(name = "canva_url", length = 500)
    private String canvaUrl;

    // Urutan di website: angka kecil tampil lebih dulu
    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isActive == null) {
            this.isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
