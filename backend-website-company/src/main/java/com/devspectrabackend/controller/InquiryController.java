package com.devspectrabackend.controller;

import com.devspectrabackend.model.Inquiry;
import com.devspectrabackend.service.InquiryService;
import com.devspectrabackend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    @Autowired
    private InquiryService inquiryService;

    @Autowired
    private OrderService orderService;

    // Publik: Calon klien mengirim pesan kontak tanpa login
    @PostMapping
    public ResponseEntity<?> createInquiry(@RequestBody Inquiry inquiry) {
        try {
            Inquiry newInquiry = inquiryService.createInquiry(inquiry);
            return ResponseEntity.ok(newInquiry);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Gagal menyimpan pesan inquiry: " + e.getMessage()));
        }
    }

    // Admin (Butuh JWT): Melihat semua daftar pesan masuk
    @GetMapping
    public ResponseEntity<List<Inquiry>> getAllInquiries() {
        return ResponseEntity.ok(inquiryService.getAllInquiries());
    }

    // Admin (Butuh JWT): Lihat detail pesan berdasarkan ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getInquiryById(@PathVariable Long id) {
        return inquiryService.getInquiryById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Pesan inquiry dengan ID " + id + " tidak ditemukan")));
    }

    // Admin (Butuh JWT): Update status pesan (PENDING / READ / REPLIED)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            Inquiry updated = inquiryService.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Admin (Butuh JWT): Tentukan anggota yang menangani pesan.
    // Body: { "userId": 3 }, atau { "userId": null } untuk mengosongkan.
    @PutMapping("/{id}/assign")
    public Inquiry assign(@PathVariable Long id, @RequestBody Map<String, Long> request) {
        return inquiryService.assign(id, request == null ? null : request.get("userId"));
    }

    // Admin (Butuh JWT): tandai proyek selesai supaya QRIS pembayaran dan tagihannya muncul untuk klien di halaman Contact.
    // Body: { "completed": true, "billAmount": 2500000 } (juga untuk mengubah tagihan),
    // atau { "completed": false } untuk membatalkan.
    @PutMapping("/{id}/project")
    public Inquiry setProjectCompleted(@PathVariable Long id, @RequestBody(required = false) OrderService.ProjectRequest request) {
        return orderService.setProjectCompleted(id, request);
    }

    // Pemegang keuangan (Butuh JWT): konfirmasi pembayaran QRIS. Pemasukan tercatat otomatis di Keuangan.
    // Body: { "paid": true, "amount": 2500000, "receivedOn": "2026-10-31" } (amount dan receivedOn boleh kosong:
    // tagihan dan hari ini), atau { "paid": false } untuk membatalkan (pemasukannya ikut dihapus).
    @PutMapping("/{id}/payment")
    public Inquiry setPayment(@PathVariable Long id, @RequestBody(required = false) OrderService.PaymentRequest request) {
        return orderService.setPayment(id, request);
    }

    // Admin (Butuh JWT): Hapus pesan masuk
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInquiry(@PathVariable Long id) {
        try {
            inquiryService.deleteInquiry(id);
            return ResponseEntity.ok(Map.of("message", "Pesan inquiry berhasil dihapus."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}