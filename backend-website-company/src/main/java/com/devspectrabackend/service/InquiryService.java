package com.devspectrabackend.service;

import com.devspectrabackend.model.Inquiry;
import java.util.List;
import java.util.Optional;

public interface InquiryService {
    Inquiry createInquiry(Inquiry inquiry);
    List<Inquiry> getAllInquiries();
    Optional<Inquiry> getInquiryById(Long id);
    Inquiry updateStatus(Long id, String status);
    Inquiry assign(Long id, Long userId);
    void deleteInquiry(Long id);
}