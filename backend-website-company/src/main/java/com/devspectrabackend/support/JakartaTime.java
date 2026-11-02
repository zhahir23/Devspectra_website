package com.devspectrabackend.support;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Tanggal dan jam WIB. Absensi dan status online selalu memakai jam Jakarta,
 * walaupun server berjalan di zona waktu lain.
 */
public final class JakartaTime {

    public static final ZoneId ZONE = ZoneId.of("Asia/Jakarta");

    private JakartaTime() {
    }

    public static LocalDate today() {
        return LocalDate.now(ZONE);
    }

    public static LocalDateTime now() {
        return LocalDateTime.now(ZONE).withNano(0);
    }
}
