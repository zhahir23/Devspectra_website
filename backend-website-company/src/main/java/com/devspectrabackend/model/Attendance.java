package com.devspectrabackend.model;

import com.devspectrabackend.support.JakartaTime;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Absensi harian: satu baris untuk satu anggota pada satu tanggal.
 * Tabelnya dibuat oleh database/devspectra-fitur-baru.sql (repo dashboard).
 */
@Data
@Entity
@Table(name = "attendances")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "check_in_at")
    private LocalDateTime checkInAt;

    @Column(name = "check_out_at")
    private LocalDateTime checkOutAt;

    // HADIR, IZIN, SAKIT, atau ALPA
    @Column(nullable = false, length = 20)
    private String status = "HADIR";

    @Column(length = 255)
    private String note;

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
