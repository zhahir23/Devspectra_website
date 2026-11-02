package com.devspectrabackend.service;

import com.devspectrabackend.model.User;
import com.devspectrabackend.repository.UserRepository;
import com.devspectrabackend.support.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

/**
 * Aturan halaman Anggota. Dipanggil UserController sebelum data apa pun disimpan.
 *
 * - Tambah anggota: hanya pemegang keuangan (email di FINANCE_EMAILS, lihat FinanceAccess).
 * - Ubah data dan ganti password: pemilik akun sendiri, atau pemegang keuangan.
 * - Hapus anggota: hanya pemegang keuangan, dan tidak untuk akunnya sendiri.
 *
 * Anggota lain mendapat 403 {"error": "..."} lewat ApiExceptionHandler.
 */
@Service
public class MemberAccess {

    @Autowired
    private CurrentUserService currentUserService;

    @Autowired
    private FinanceAccess financeAccess;

    @Autowired
    private UserRepository userRepository;

    /** POST /api/users */
    public void checkCreate(User newUser) {
        User me = currentUserService.require();
        if (!financeAccess.allows(me.getEmail())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Hanya pemegang keuangan yang bisa menambah anggota.");
        }
        requireValidPassword(newUser.getPassword());

        // createUser menimpa akun lama kalau emailnya sudah ada, jadi email ganda ditolak di sini
        String email = newUser.getEmail() == null ? "" : newUser.getEmail().trim();
        boolean taken = userRepository.findAll().stream()
                .anyMatch(u -> u.getEmail() != null && u.getEmail().trim().equalsIgnoreCase(email));
        if (taken) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Email ini sudah terdaftar. Kalau anggotanya lupa password, pakai Atur ulang password.");
        }
    }

    /** PUT /api/users/{id}: nama, peran, divisi, dan password (kalau diisi) */
    public void checkUpdate(Long targetId, User details) {
        User me = currentUserService.require();
        if (!me.getId().equals(targetId) && !financeAccess.allows(me.getEmail())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Kamu hanya bisa mengubah data dan password akunmu sendiri.");
        }
        String password = details.getPassword();
        if (password != null && !password.isEmpty()) {
            requireValidPassword(password);
        }
    }

    /** DELETE /api/users/{id} */
    public void checkDelete(Long targetId) {
        User me = currentUserService.require();
        if (!financeAccess.allows(me.getEmail())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Hanya pemegang keuangan yang bisa menghapus anggota.");
        }
        if (me.getId().equals(targetId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Akun sendiri tidak bisa dihapus.");
        }
    }

    /** Sama dengan aturan di dashboard (src/lib/password.js). BCrypt hanya membaca 72 byte pertama. */
    private void requireValidPassword(String password) {
        if (password == null || password.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password wajib diisi.");
        }
        if (password.length() < 8) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password minimal 8 karakter.");
        }
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password terlalu panjang. Maksimal 72 karakter.");
        }
        if (!password.equals(password.strip())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Hapus spasi di awal atau akhir password.");
        }
    }
}
