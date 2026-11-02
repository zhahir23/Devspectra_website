package com.devspectrabackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "services")
@Data
public class ServiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, unique = true, length = 150)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_class", length = 100)
    private String iconClass;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(length = 100)
    private String icon;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        // Sinkronisasi otomatis title dan name agar tidak null
        if (this.title == null && this.name != null) this.title = this.name;
        if (this.name == null && this.title != null) this.name = this.title;

        // Buat slug otomatis jika kosong
        if (this.slug == null && this.title != null) {
            this.slug = this.title.toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", "-");
        }

        if (this.isActive == null) {
            this.isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.title == null && this.name != null) this.title = this.name;
        if (this.name == null && this.title != null) this.name = this.title;
    }
}