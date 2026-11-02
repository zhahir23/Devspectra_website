package com.devspectrabackend.support;

import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Locale;

/** Pemeriksaan isian dari dashboard. Pesan kesalahannya tampil apa adanya di dashboard. */
public final class InputRules {

    private InputRules() {
    }

    public static ApiException bad(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    /** Spasi di awal dan akhir dibuang; isian kosong menjadi null. */
    public static String clean(String value) {
        if (value == null) return null;
        String text = value.trim();
        return text.isEmpty() ? null : text;
    }

    public static String required(String value, int maxLength, String emptyMessage, String tooLongMessage) {
        String text = clean(value);
        if (text == null) throw bad(emptyMessage);
        if (text.length() > maxLength) throw bad(tooLongMessage);
        return text;
    }

    public static String optional(String value, int maxLength, String tooLongMessage) {
        String text = clean(value);
        if (text != null && text.length() > maxLength) throw bad(tooLongMessage);
        return text;
    }

    /** Salah satu dari pilihan (huruf besar/kecil tidak dibedakan). Yang disimpan ejaan dari daftar pilihan. */
    public static String oneOf(String value, List<String> choices, String message) {
        String text = clean(value);
        if (text != null) {
            for (String choice : choices) {
                if (choice.equalsIgnoreCase(text)) return choice;
            }
        }
        throw bad(message);
    }

    /**
     * Tautan yang aman dipasang di tombol website: kosong (null), atau diawali http:// atau https://.
     * Alamat lain (misalnya "javascript:...") ditolak supaya tidak bisa menjalankan kode di website.
     */
    public static String httpUrl(String value, int maxLength, String message) {
        String text = clean(value);
        if (text == null) return null;
        String lower = text.toLowerCase(Locale.ROOT);
        boolean http = lower.startsWith("https://") || lower.startsWith("http://");
        if (!http || text.length() > maxLength || hasUnsafeCharacter(text) || text.length() <= lower.indexOf("//") + 2) {
            throw bad(message);
        }
        return text;
    }

    /** Spasi, tanda kutip, kurung sudut, dan garis miring terbalik tidak boleh ada di alamat. */
    public static boolean hasUnsafeCharacter(String text) {
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (Character.isWhitespace(c) || Character.isISOControl(c)
                    || c == '"' || c == '\'' || c == '<' || c == '>' || c == '\\' || c == '`') {
                return true;
            }
        }
        return false;
    }
}
