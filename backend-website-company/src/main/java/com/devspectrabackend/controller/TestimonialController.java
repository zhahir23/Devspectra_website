package com.devspectrabackend.controller;

import com.devspectrabackend.model.Testimonial;
import com.devspectrabackend.service.CurrentUserService;
import com.devspectrabackend.service.TestimonialService;
import com.devspectrabackend.service.VisitorReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/testimonials")
public class TestimonialController {

    @Autowired
    private TestimonialService testimonialService;

    @Autowired
    private CurrentUserService currentUserService;

    @Autowired
    private VisitorReviewService visitorReviewService;

    // 1. Publik (Tanpa Token): Lihat testimoni klien. Pengunjung website hanya mendapat yang ditampilkan;
    //    dashboard (dengan token) mendapat semuanya, termasuk yang disembunyikan.
    @GetMapping
    public ResponseEntity<List<Testimonial>> getAllTestimonials() {
        List<Testimonial> all = testimonialService.getAllTestimonials();
        if (!currentUserService.isLoggedIn()) {
            all = all.stream().filter(t -> !Boolean.FALSE.equals(t.getIsActive())).toList();
        }
        return ResponseEntity.ok(all);
    }

    // 2. Publik (Tanpa Token): Lihat detail testimoni berdasarkan ID (yang disembunyikan hanya untuk tim)
    @GetMapping("/{id}")
    public ResponseEntity<?> getTestimonialById(@PathVariable Long id) {
        boolean member = currentUserService.isLoggedIn();
        return testimonialService.getTestimonialById(id)
                .filter(t -> member || !Boolean.FALSE.equals(t.getIsActive()))
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Testimoni dengan ID " + id + " tidak ditemukan")));
    }

    // 3. Tambah testimoni.
    //    Tanpa token: penilaian pengunjung dari halaman Contact website (VisitorReviewService).
    //    Bintang 3-5 yang berisi ulasan langsung tampil, bintang 1-2 atau tanpa ulasan disembunyikan.
    //    Dengan token (dashboard): disimpan apa adanya.
    @PostMapping
    public ResponseEntity<?> createTestimonial(@RequestBody Testimonial testimonial) {
        if (!currentUserService.isLoggedIn()) {
            Testimonial review = visitorReviewService.fromVisitor(testimonial);
            return ResponseEntity.ok(testimonialService.createTestimonial(review));
        }
        try {
            Testimonial created = testimonialService.createTestimonial(testimonial);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Gagal menambahkan testimoni: " + e.getMessage()));
        }
    }

    // 4. Tim Internal (Wajib JWT): Perbarui testimoni
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTestimonial(@PathVariable Long id, @RequestBody Testimonial testimonialDetails) {
        try {
            Testimonial updated = testimonialService.updateTestimonial(id, testimonialDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // 5. Tim Internal (Wajib JWT): Hapus testimoni
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTestimonial(@PathVariable Long id) {
        try {
            testimonialService.deleteTestimonial(id);
            return ResponseEntity.ok(Map.of("message", "Testimoni dengan ID " + id + " berhasil dihapus."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}