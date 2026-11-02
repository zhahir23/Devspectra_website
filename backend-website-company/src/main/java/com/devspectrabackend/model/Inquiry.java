package com.devspectrabackend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "inquiries")
public class Inquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String phone;
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String message;

    // Biarkan database mengisi nilai default bawaannya secara otomatis saat INSERT
    @Column(insertable = false)
    private String status;

    // Anggota yang menangani pesan ini (users.id). Hanya bisa diubah lewat
    // PUT /api/inquiries/{id}/assign, tidak ikut terbaca dari formulir kontak.
    @Column(name = "assigned_to")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long assignedTo;

    // ID pesanan dari formulir kontak website, misalnya "DSP-BLM5XPQO". Klien memakainya
    // untuk mengecek status pembayaran QRIS di halaman Contact (GET /api/orders/{orderId}).
    @Column(name = "order_id", length = 20)
    private String orderId;

    // Kapan tim menandai proyek selesai (dashboard: Klien masuk). Setelah diisi, QRIS pembayaran
    // muncul untuk klien di halaman Contact. Hanya bisa diubah lewat PUT /api/inquiries/{id}/project.
    @Column(name = "project_completed_at")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime projectCompletedAt;

    // Tagihan proyek dalam rupiah, diisi saat menandai proyek selesai. Tampil ke klien di samping QRIS.
    @Column(name = "bill_amount")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long billAmount;

    // Kapan pemegang keuangan mengonfirmasi pembayaran QRIS (PUT /api/inquiries/{id}/payment).
    @Column(name = "paid_at")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime paidAt;

    // Pemasukan (incomes.id) yang tercatat otomatis saat pembayaran dikonfirmasi.
    @Column(name = "income_id")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long incomeId;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}