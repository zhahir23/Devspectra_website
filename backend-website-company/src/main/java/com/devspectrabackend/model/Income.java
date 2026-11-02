package com.devspectrabackend.model;

import com.devspectrabackend.support.JakartaTime;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Catatan pemasukan. Hanya bisa dibaca dan diubah dua pemegang keuangan (lihat FinanceAccess). */
@Data
@Entity
@Table(name = "incomes")
public class Income {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "received_on", nullable = false)
    private LocalDate receivedOn;

    @Column(nullable = false, length = 200)
    private String description;

    @Column(name = "client_name", length = 150)
    private String clientName;

    // PROYEK, PERAWATAN, atau LAINNYA
    @Column(nullable = false, length = 30)
    private String category = "PROYEK";

    // Rupiah penuh tanpa desimal, misalnya 2500000
    @Column(nullable = false)
    private Long amount;

    // users.id anggota yang mencatat
    @Column(name = "recorded_by")
    private Long recordedBy;

    // ID pesanan (DSP-...) kalau pemasukan ini tercatat otomatis dari konfirmasi pembayaran QRIS
    // di Klien masuk (OrderService). Kosong untuk pemasukan yang dicatat manual.
    @Column(name = "order_id", length = 20)
    private String orderId;

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
