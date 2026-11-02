package com.devspectrabackend.service;

import com.devspectrabackend.model.User;
import com.devspectrabackend.model.UserPresence;
import com.devspectrabackend.repository.UserPresenceRepository;
import com.devspectrabackend.support.JakartaTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Status online/offline. Dashboard mengirim heartbeat tiap 60 detik selama dibuka.
 * Anggota dianggap online kalau heartbeat terakhirnya kurang dari 2 menit yang lalu.
 */
@Service
public class PresenceService {

    private static final Duration ONLINE_WINDOW = Duration.ofMinutes(2);

    @Autowired
    private UserPresenceRepository presenceRepository;

    @Autowired
    private CurrentUserService currentUserService;

    /** Satu baris: { userId, lastSeenAt, online } */
    public record PresenceResponse(Long userId, LocalDateTime lastSeenAt, boolean online) {
    }

    // Dikirim tiap menit oleh setiap dashboard yang terbuka: tiga query dalam satu transaksi
    @Transactional
    public void heartbeat() {
        User me = currentUserService.require();
        UserPresence presence = presenceRepository.findById(me.getId()).orElseGet(UserPresence::new);
        presence.setUserId(me.getId());
        presence.setLastSeenAt(JakartaTime.now());
        presenceRepository.save(presence);
    }

    public List<PresenceResponse> list() {
        LocalDateTime now = JakartaTime.now();
        return presenceRepository.findAll().stream()
                .map(p -> new PresenceResponse(p.getUserId(), p.getLastSeenAt(),
                        Duration.between(p.getLastSeenAt(), now).compareTo(ONLINE_WINDOW) < 0))
                .toList();
    }
}
