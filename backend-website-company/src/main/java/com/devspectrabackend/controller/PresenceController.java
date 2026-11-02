package com.devspectrabackend.controller;

import com.devspectrabackend.service.PresenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Status online/offline anggota (butuh JWT). */
@RestController
@RequestMapping("/api/presence")
public class PresenceController {

    @Autowired
    private PresenceService presenceService;

    @GetMapping
    public List<PresenceService.PresenceResponse> list() {
        return presenceService.list();
    }

    // Dikirim dashboard tiap 60 detik untuk anggota yang login
    @PostMapping("/heartbeat")
    public ResponseEntity<Void> heartbeat() {
        presenceService.heartbeat();
        return ResponseEntity.noContent().build();
    }
}
