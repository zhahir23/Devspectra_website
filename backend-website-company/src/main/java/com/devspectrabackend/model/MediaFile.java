package com.devspectrabackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Gambar yang diunggah dari dashboard (gambar project, foto anggota tim).
 * Disimpan di database supaya tidak hilang saat backend dipindah atau dipasang ulang,
 * dan dibuka website lewat GET /api/media/{id} (MediaController).
 *
 * Sengaja tanpa Lombok @Data: toString() bawaan Lombok akan ikut mencetak seluruh isi gambar.
 */
@Entity
@Table(name = "website_media")
public class MediaFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // image/webp, image/jpeg, atau image/png (diperiksa MediaService)
    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType;

    @JsonIgnore
    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] data;

    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    // Email anggota yang mengunggah
    @Column(name = "uploaded_by", length = 150)
    private String uploadedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public byte[] getData() { return data; }
    public void setData(byte[] data) { this.data = data; }

    public Long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(Long sizeBytes) { this.sizeBytes = sizeBytes; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
