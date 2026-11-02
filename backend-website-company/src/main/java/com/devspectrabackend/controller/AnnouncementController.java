package com.devspectrabackend.controller;

import com.devspectrabackend.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Pengumuman di halaman Ringkasan dashboard (butuh JWT). */
@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    /** Body: { "message": "..." } */
    public record CreateRequest(String message) {
    }

    // Pengumuman aktif terbaru. Kalau belum ada, balas 200 dengan body kosong
    // (bukan 404, karena bagi dashboard 404 artinya endpoint-nya belum dibuat).
    @GetMapping("/latest")
    public ResponseEntity<AnnouncementService.AnnouncementResponse> latest() {
        return announcementService.latest()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok().build());
    }

    // Buat pengumuman baru. Pengumuman lama otomatis tidak aktif lagi.
    @PostMapping
    public AnnouncementService.AnnouncementResponse create(@RequestBody CreateRequest request) {
        return announcementService.create(request == null ? null : request.message());
    }
}
