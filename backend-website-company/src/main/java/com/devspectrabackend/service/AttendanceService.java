package com.devspectrabackend.service;

import com.devspectrabackend.model.Attendance;
import com.devspectrabackend.model.User;
import com.devspectrabackend.repository.AttendanceRepository;
import com.devspectrabackend.repository.UserRepository;
import com.devspectrabackend.support.ApiException;
import com.devspectrabackend.support.JakartaTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Set;

/**
 * Absensi: absen masuk/pulang, koreksi absensi, dan rekap bulanan.
 * Setiap anggota hanya bisa mengisi atau mengubah absensinya sendiri.
 */
@Service
public class AttendanceService {

    private static final Set<String> STATUSES = Set.of("HADIR", "IZIN", "SAKIT", "ALPA");

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CurrentUserService currentUserService;

    /** Body dari dashboard: { userId, workDate, status, note, checkInAt, checkOutAt } */
    public record SaveRequest(Long userId, LocalDate workDate, String status, String note,
                              LocalDateTime checkInAt, LocalDateTime checkOutAt) {
    }

    /** Satu baris rekap: { userId, hadir, izin, sakit, alpa } */
    public record MonthlySummary(Long userId, long hadir, long izin, long sakit, long alpa) {
    }

    public List<Attendance> byDate(String date) {
        return attendanceRepository.findByWorkDate(parseDate(date));
    }

    @Transactional
    public Attendance checkIn() {
        User me = currentUserService.require();
        LocalDate today = JakartaTime.today();
        Attendance row = attendanceRepository.findByUserIdAndWorkDate(me.getId(), today)
                .orElseGet(() -> newRow(me.getId(), today));
        if (row.getCheckInAt() != null) {
            throw new ApiException(HttpStatus.CONFLICT, "Kamu sudah absen masuk hari ini.");
        }
        row.setStatus("HADIR");
        row.setCheckInAt(JakartaTime.now());
        return attendanceRepository.save(row);
    }

    @Transactional
    public Attendance checkOut() {
        User me = currentUserService.require();
        Attendance row = attendanceRepository.findByUserIdAndWorkDate(me.getId(), JakartaTime.today())
                .filter(a -> a.getCheckInAt() != null)
                .orElseThrow(() -> new ApiException(HttpStatus.CONFLICT, "Kamu belum absen masuk hari ini."));
        if (row.getCheckOutAt() != null) {
            throw new ApiException(HttpStatus.CONFLICT, "Kamu sudah absen pulang hari ini.");
        }
        row.setCheckOutAt(JakartaTime.now());
        return attendanceRepository.save(row);
    }

    /**
     * Anggota mengisi atau mengoreksi absensinya sendiri. Kalau sudah ada baris di tanggal
     * yang sama, baris itu yang diubah. userId milik anggota lain ditolak (403).
     */
    @Transactional
    public Attendance save(SaveRequest request) {
        if (request == null || request.userId() == null || request.workDate() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "userId dan workDate wajib diisi.");
        }
        requireOwner(request.userId());
        Attendance row = attendanceRepository.findByUserIdAndWorkDate(request.userId(), request.workDate())
                .orElseGet(() -> newRow(request.userId(), request.workDate()));
        apply(row, request);
        return attendanceRepository.save(row);
    }

    /** Ubah satu baris milik sendiri. Anggota dan tanggalnya tidak ikut berubah. */
    @Transactional
    public Attendance update(Long id, SaveRequest request) {
        Attendance row = attendanceRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Data absensi tidak ditemukan."));
        requireOwner(row.getUserId());
        if (request == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Data absensi kosong.");
        }
        apply(row, request);
        return attendanceRepository.save(row);
    }

    /** Tolak kalau absensi itu bukan milik anggota yang sedang login. */
    private void requireOwner(Long userId) {
        User me = currentUserService.require();
        if (!me.getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Kamu hanya bisa mengubah absensi milikmu sendiri.");
        }
    }

    /** Rekap semua anggota untuk satu bulan (format month: 2026-10). Anggota tanpa absensi tetap muncul dengan angka 0. */
    // Satu transaksi untuk dua query (daftar anggota + absensi sebulan): lebih sedikit bolak-balik ke database
    @Transactional(readOnly = true)
    public List<MonthlySummary> summary(String month) {
        YearMonth period = parseMonth(month);
        List<Attendance> rows = attendanceRepository.findByWorkDateBetween(period.atDay(1), period.atEndOfMonth());
        return userRepository.findAll().stream()
                .map(user -> {
                    List<Attendance> mine = rows.stream().filter(a -> user.getId().equals(a.getUserId())).toList();
                    return new MonthlySummary(user.getId(), count(mine, "HADIR"), count(mine, "IZIN"),
                            count(mine, "SAKIT"), count(mine, "ALPA"));
                })
                .toList();
    }

    private static long count(List<Attendance> rows, String status) {
        return rows.stream().filter(a -> status.equals(a.getStatus())).count();
    }

    private static Attendance newRow(Long userId, LocalDate workDate) {
        Attendance row = new Attendance();
        row.setUserId(userId);
        row.setWorkDate(workDate);
        return row;
    }

    private static void apply(Attendance row, SaveRequest request) {
        String status = request.status() == null || request.status().isBlank()
                ? "HADIR"
                : request.status().trim().toUpperCase();
        if (!STATUSES.contains(status)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Status absensi harus HADIR, IZIN, SAKIT, atau ALPA.");
        }
        // Izin, sakit, dan alpa tidak punya jam masuk/pulang
        boolean present = "HADIR".equals(status);
        LocalDateTime checkIn = present ? request.checkInAt() : null;
        LocalDateTime checkOut = present ? request.checkOutAt() : null;
        if (checkIn != null && checkOut != null && checkOut.isBefore(checkIn)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Jam pulang tidak boleh lebih awal dari jam masuk.");
        }
        String note = request.note() == null || request.note().isBlank() ? null : request.note().trim();
        if (note != null && note.length() > 255) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Catatan maksimal 255 karakter.");
        }
        row.setStatus(status);
        row.setNote(note);
        row.setCheckInAt(checkIn);
        row.setCheckOutAt(checkOut);
    }

    private static LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return JakartaTime.today();
        }
        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Format tanggal harus YYYY-MM-DD, misalnya 2026-10-19.");
        }
    }

    private static YearMonth parseMonth(String value) {
        if (value == null || value.isBlank()) {
            return YearMonth.from(JakartaTime.today());
        }
        try {
            return YearMonth.parse(value.trim());
        } catch (DateTimeParseException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Format bulan harus YYYY-MM, misalnya 2026-10.");
        }
    }
}
