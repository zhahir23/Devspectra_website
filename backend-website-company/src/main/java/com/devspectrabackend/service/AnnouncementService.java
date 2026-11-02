package com.devspectrabackend.service;

import com.devspectrabackend.model.Announcement;
import com.devspectrabackend.model.User;
import com.devspectrabackend.repository.AnnouncementRepository;
import com.devspectrabackend.repository.UserRepository;
import com.devspectrabackend.support.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/** Pengumuman untuk semua anggota. Pengumuman baru menggantikan yang lama. */
@Service
public class AnnouncementService {

    private static final int MAX_LENGTH = 500;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CurrentUserService currentUserService;

    /** Yang dikirim ke dashboard: { id, message, createdBy, createdByName, createdAt } */
    public record AnnouncementResponse(Long id, String message, Long createdBy, String createdByName,
                                       LocalDateTime createdAt) {
    }

    @Transactional(readOnly = true)
    public Optional<AnnouncementResponse> latest() {
        return announcementRepository.findFirstByIsActiveTrueOrderByCreatedAtDescIdDesc().map(this::toResponse);
    }

    @Transactional
    public AnnouncementResponse create(String message) {
        User me = currentUserService.require();
        String text = message == null ? "" : message.trim();
        if (text.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Isi pengumuman tidak boleh kosong.");
        }
        if (text.length() > MAX_LENGTH) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Pengumuman maksimal " + MAX_LENGTH + " karakter.");
        }
        List<Announcement> active = announcementRepository.findByIsActiveTrue();
        active.forEach(a -> a.setIsActive(false));
        announcementRepository.saveAll(active);

        Announcement announcement = new Announcement();
        announcement.setMessage(text);
        announcement.setCreatedBy(me.getId());
        announcement.setIsActive(true);
        return toResponse(announcementRepository.save(announcement));
    }

    private AnnouncementResponse toResponse(Announcement announcement) {
        String createdByName = announcement.getCreatedBy() == null
                ? null
                : userRepository.findById(announcement.getCreatedBy()).map(User::getName).orElse(null);
        return new AnnouncementResponse(announcement.getId(), announcement.getMessage(),
                announcement.getCreatedBy(), createdByName, announcement.getCreatedAt());
    }
}
