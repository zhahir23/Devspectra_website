package com.devspectrabackend.controller;

import com.devspectrabackend.model.User;
import com.devspectrabackend.service.MemberAccess;
import com.devspectrabackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Aturan siapa boleh menambah, mengubah, dan menghapus anggota (service/MemberAccess).
    // Pemeriksaannya sengaja di luar blok try, supaya penolakan 403 tidak berubah menjadi 400/404.
    @Autowired
    private MemberAccess memberAccess;

    // 1. Tambah Anggota Tim Baru (hanya pemegang keuangan)
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        memberAccess.checkCreate(user);
        try {
            User newUser = userService.createUser(user);
            return ResponseEntity.ok(newUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // 2. Lihat Semua Daftar Anggota Tim DevSpectra
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // 3. Lihat Detail Anggota Tim Berdasarkan ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Anggota tim dengan ID " + id + " tidak ditemukan")));
    }

    // 4. Perbarui Data Anggota Tim (akun sendiri, atau pemegang keuangan)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        memberAccess.checkUpdate(id, userDetails);
        try {
            User updatedUser = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // 5. Hapus Akun Anggota Tim (hanya pemegang keuangan, bukan akunnya sendiri)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        memberAccess.checkDelete(id);
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "Akun anggota tim dengan ID " + id + " berhasil dihapus."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}