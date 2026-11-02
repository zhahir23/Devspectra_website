package com.devspectrabackend.service;

import com.devspectrabackend.model.Testimonial;
import com.devspectrabackend.support.InputRules;
import org.springframework.stereotype.Service;

/**
 * Penilaian dari pengunjung website (halaman Contact, "Penilaian & Kritik Saran"), dikirim tanpa login
 * ke POST /api/testimonials. Masuk ke dashboard (Konten website > Testimoni) supaya tim bisa mengubah,
 * menampilkan, atau menyembunyikannya.
 *
 * Aturan tampil otomatis di bagian "Apa Kata Mereka":
 * - bintang 3-5 yang berisi ulasan: langsung tampil
 * - bintang 1-2, atau tanpa ulasan: disembunyikan
 */
@Service
public class VisitorReviewService {

    public static final int SHOW_FROM_RATING = 3;

    /** Data dari website dibuat ulang di sini: hanya nama, ulasan, dan bintang yang dipakai. */
    public Testimonial fromVisitor(Testimonial input) {
        if (input == null) throw InputRules.bad("Data penilaian kosong.");
        Integer rating = input.getRating();
        if (rating == null || rating < 1 || rating > 5) {
            throw InputRules.bad("Pilih penilaian bintang 1 sampai 5.");
        }
        String name = InputRules.optional(input.getClientName(), 100, "Nama maksimal 100 karakter.");
        String content = InputRules.optional(input.getContent(), 1000, "Kritik dan saran maksimal 1000 karakter.");

        Testimonial review = new Testimonial();
        review.setClientName(name == null ? "Anonim" : name);
        review.setCompany(null);
        review.setContent(content);
        review.setRating(rating);
        review.setIsActive(rating >= SHOW_FROM_RATING && content != null);
        review.setFromWebsite(true);
        return review;
    }
}
