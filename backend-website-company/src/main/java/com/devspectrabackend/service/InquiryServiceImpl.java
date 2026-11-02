package com.devspectrabackend.service;

import com.devspectrabackend.model.Inquiry;
import com.devspectrabackend.repository.InquiryRepository;
import com.devspectrabackend.repository.UserRepository;
import com.devspectrabackend.support.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InquiryServiceImpl implements InquiryService {

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Inquiry createInquiry(Inquiry inquiry) {
        // ID pesanan untuk cek status QRIS (OrderService); proyek selalu mulai dari belum selesai dan belum dibayar
        inquiry.setOrderId(OrderService.orderIdFor(inquiry));
        inquiry.setProjectCompletedAt(null);
        inquiry.setBillAmount(null);
        inquiry.setPaidAt(null);
        inquiry.setIncomeId(null);
        return inquiryRepository.save(inquiry);
    }

    @Override
    public List<Inquiry> getAllInquiries() {
        return inquiryRepository.findAll();
    }

    @Override
    public Optional<Inquiry> getInquiryById(Long id) {
        return inquiryRepository.findById(id);
    }

    @Override
    public Inquiry updateStatus(Long id, String status) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pesan inquiry dengan ID " + id + " tidak ditemukan"));
        inquiry.setStatus(status);
        return inquiryRepository.save(inquiry);
    }

    @Override
    public Inquiry assign(Long id, Long userId) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pesan inquiry dengan ID " + id + " tidak ditemukan"));
        if (userId != null && !userRepository.existsById(userId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Anggota tim dengan ID " + userId + " tidak ditemukan");
        }
        inquiry.setAssignedTo(userId);
        return inquiryRepository.save(inquiry);
    }

    @Override
    public void deleteInquiry(Long id) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pesan inquiry dengan ID " + id + " tidak ditemukan"));
        inquiryRepository.delete(inquiry);
    }
}