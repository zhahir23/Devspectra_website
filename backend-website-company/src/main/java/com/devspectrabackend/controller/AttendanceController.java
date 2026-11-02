package com.devspectrabackend.controller;

import com.devspectrabackend.model.Attendance;
import com.devspectrabackend.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Absensi (butuh JWT). Dipakai halaman Absensi dan Anggota di dashboard. */
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // Semua absensi pada satu tanggal, misalnya ?date=2026-10-19 (bawaan: hari ini, WIB)
    @GetMapping
    public List<Attendance> byDate(@RequestParam(required = false) String date) {
        return attendanceService.byDate(date);
    }

    // Rekap per anggota untuk satu bulan, misalnya ?month=2026-10
    @GetMapping("/summary")
    public List<AttendanceService.MonthlySummary> summary(@RequestParam(required = false) String month) {
        return attendanceService.summary(month);
    }

    // Absen masuk untuk anggota yang login. Jam diisi server.
    @PostMapping("/check-in")
    public Attendance checkIn() {
        return attendanceService.checkIn();
    }

    // Absen pulang untuk anggota yang login
    @PostMapping("/check-out")
    public Attendance checkOut() {
        return attendanceService.checkOut();
    }

    // Anggota mengisi atau mengoreksi absensinya sendiri (userId anggota lain ditolak 403)
    @PostMapping
    public Attendance save(@RequestBody AttendanceService.SaveRequest request) {
        return attendanceService.save(request);
    }

    // Ubah satu baris absensi milik sendiri
    @PutMapping("/{id}")
    public Attendance update(@PathVariable Long id, @RequestBody AttendanceService.SaveRequest request) {
        return attendanceService.update(id, request);
    }
}
