package com.devspectrabackend.controller;

import com.devspectrabackend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Publik (tanpa login): klien mengecek status pembayaran QRIS di halaman Contact website
 * dengan ID pesanan dari formulir kontak. Hanya status yang dikirim, tanpa data pesan.
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // { "orderId": "DSP-BLM5XPQO", "status": "pending" | "completed" | "paid", "completedAt": "...",
    //   "billAmount": 2500000 (setelah proyek selesai), "paidAt": "..." }
    @GetMapping("/{orderId}")
    public ResponseEntity<?> status(@PathVariable String orderId) {
        return orderService.status(orderId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "ID pesanan tidak ditemukan.")));
    }
}
