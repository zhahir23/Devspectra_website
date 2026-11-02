package com.devspectrabackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Anggota tim yang tampil di website company: halaman Divisi, bagian "Tim Kami" di beranda,
 * dan pilihan anggota di formulir Contact. Dikelola dari dashboard (Konten website > Divisi).
 *
 * Terpisah dari tabel users (akun login dashboard): tidak semua akun tampil di website,
 * dan tidak semua anggota yang tampil punya akun.
 */
@Entity
@Table(name = "website_team_members")
@Data
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    // Posisi, misalnya "Developer of Devspectra"
    @Column(length = 200)
    private String role;

    // "IT", "Media", atau "Marketing", sama dengan pilihan di menu Divisi di website
    @Column(nullable = false, length = 30)
    private String division;

    @Column(length = 150)
    private String email;

    // Tampil di lingkaran avatar kalau belum ada foto, misalnya "BW"
    @Column(length = 4)
    private String initials;

    // Kosong = memakai inisial. "/api/media/12" = foto yang diunggah dari dashboard
    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    // Urutan di website: angka kecil tampil lebih dulu
    @Column(name = "sort_order")
    private Integer sortOrder;

    // Bagian "Tim Kami" di beranda website
    @Column(name = "show_on_home", nullable = false)
    private Boolean showOnHome = true;

    // Halaman Divisi
    @Column(name = "show_in_division", nullable = false)
    private Boolean showInDivision = true;

    // Pilihan "Anggota Tim" di formulir Contact
    @Column(name = "show_in_contact", nullable = false)
    private Boolean showInContact = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.showOnHome == null) this.showOnHome = true;
        if (this.showInDivision == null) this.showInDivision = true;
        if (this.showInContact == null) this.showInContact = true;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /** true kalau tampil di setidaknya satu tempat di website. */
    public boolean shownAnywhere() {
        return !Boolean.FALSE.equals(showOnHome)
                || !Boolean.FALSE.equals(showInDivision)
                || !Boolean.FALSE.equals(showInContact);
    }
}
