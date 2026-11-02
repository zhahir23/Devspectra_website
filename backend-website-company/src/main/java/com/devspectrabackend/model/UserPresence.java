package com.devspectrabackend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/** Kapan seorang anggota terakhir aktif di dashboard. Satu baris per anggota. */
@Data
@Entity
@Table(name = "user_presence")
public class UserPresence {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "last_seen_at", nullable = false)
    private LocalDateTime lastSeenAt;
}
