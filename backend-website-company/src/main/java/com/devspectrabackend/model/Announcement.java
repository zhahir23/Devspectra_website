package com.devspectrabackend.model;

import com.devspectrabackend.support.JakartaTime;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/** Pengumuman di kartu sambutan dashboard. Hanya satu yang aktif: yang paling baru. */
@Data
@Entity
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    // users.id anggota yang menulis
    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = JakartaTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = JakartaTime.now();
    }
}
