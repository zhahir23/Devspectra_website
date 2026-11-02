package com.devspectrabackend.controller;

import com.devspectrabackend.service.MediaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Gambar project dan foto anggota tim yang diunggah dari dashboard (publik, dipakai website).
 * Gambar tidak pernah diubah: gambar pengganti selalu mendapat alamat baru, jadi browser boleh
 * menyimpannya selama setahun.
 */
@RestController
@RequestMapping("/api/media")
public class MediaController {

    @Autowired
    private MediaService mediaService;

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> get(@PathVariable Long id) {
        return mediaService.find(id)
                .map(file -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(file.getContentType()))
                        .header("Cache-Control", "public, max-age=31536000, immutable")
                        .header("Content-Disposition", "inline")
                        .header("X-Content-Type-Options", "nosniff")
                        .body(file.getData()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
