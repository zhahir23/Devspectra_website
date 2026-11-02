package com.devspectrabackend.service;

import com.devspectrabackend.model.MediaFile;
import com.devspectrabackend.repository.MediaFileRepository;
import com.devspectrabackend.repository.ProjectRepository;
import com.devspectrabackend.repository.TeamMemberRepository;
import com.devspectrabackend.support.InputRules;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Gambar yang diunggah dari dashboard (gambar project dan foto anggota tim), disimpan di tabel website_media.
 *
 * Dashboard mengirim gambar sebagai data URL ("data:image/webp;base64,...") di dalam data project atau
 * anggota tim, setelah lebih dulu diperkecil di browser. Website membukanya lewat GET /api/media/{id}.
 * Gambar lama dihapus otomatis kalau sudah tidak dipakai project atau anggota tim mana pun.
 */
@Service
public class MediaService {

    public static final String URL_PREFIX = "/api/media/";

    // Dashboard memperkecil gambar dulu (biasanya di bawah 500 KB), jadi batas ini hanya pengaman
    public static final int MAX_BYTES = 3 * 1024 * 1024;

    public static final List<String> CONTENT_TYPES = List.of("image/webp", "image/jpeg", "image/png");

    @Autowired
    private MediaFileRepository mediaFileRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Transactional(readOnly = true)
    public Optional<MediaFile> find(Long id) {
        return mediaFileRepository.findById(id);
    }

    /**
     * Alamat gambar setelah disimpan dari dashboard.
     *
     * @param current    alamat gambar yang sekarang (null untuk data baru)
     * @param url        null = tidak berubah, "" = gambar dihapus, selain itu alamat yang sudah ada
     * @param data       data URL gambar baru; kalau diisi, gambar ini yang dipakai
     * @param uploadedBy email anggota yang mengunggah
     */
    @Transactional
    public String resolveImage(String current, String url, String data, String uploadedBy) {
        if (InputRules.clean(data) != null) {
            return store(data, uploadedBy);
        }
        if (url == null) {
            return current;
        }
        String text = InputRules.clean(url);
        if (text == null) {
            return null;
        }
        if (text.equals(current)) {
            return current;
        }
        return safeImageUrl(text);
    }

    /** Simpan data URL gambar, kembalikan alamatnya ("/api/media/{id}"). */
    @Transactional
    public String store(String dataUrl, String uploadedBy) {
        Decoded image = decode(dataUrl);
        MediaFile file = new MediaFile();
        file.setContentType(image.contentType());
        file.setData(image.bytes());
        file.setSizeBytes((long) image.bytes().length);
        file.setUploadedBy(uploadedBy);
        return URL_PREFIX + mediaFileRepository.save(file).getId();
    }

    /** Hapus gambar di alamat ini kalau sudah tidak dipakai project atau anggota tim mana pun. */
    @Transactional
    public void deleteIfUnused(String url) {
        Long id = idFromUrl(url);
        if (id == null) return;
        if (projectRepository.existsByImageUrl(url) || teamMemberRepository.existsByPhotoUrl(url)) return;
        if (mediaFileRepository.existsById(id)) {
            mediaFileRepository.deleteById(id);
        }
    }

    /** "/api/media/12" -> 12. Alamat lain (misalnya file di folder public website) -> null. */
    public static Long idFromUrl(String url) {
        if (url == null || !url.startsWith(URL_PREFIX)) return null;
        String rest = url.substring(URL_PREFIX.length());
        if (rest.isEmpty() || rest.length() > 18) return null;
        for (int i = 0; i < rest.length(); i++) {
            if (!Character.isDigit(rest.charAt(i))) return null;
        }
        return Long.parseLong(rest);
    }

    /**
     * Alamat gambar yang boleh disimpan apa adanya: file di website ("/projects/braka.png"),
     * gambar di backend ini ("/api/media/12"), atau alamat http(s) lengkap.
     */
    public static String safeImageUrl(String url) {
        String text = InputRules.clean(url);
        if (text == null) return null;
        String lower = text.toLowerCase(Locale.ROOT);
        boolean relative = text.startsWith("/") && !text.startsWith("//");
        boolean http = lower.startsWith("https://") || lower.startsWith("http://");
        if ((!relative && !http) || text.length() > 500 || InputRules.hasUnsafeCharacter(text)) {
            throw InputRules.bad("Alamat gambar tidak valid. Pilih ulang gambarnya.");
        }
        return text;
    }

    public record Decoded(String contentType, byte[] bytes) {
    }

    /** "data:image/webp;base64,...." -> jenis dan isi gambar. Isi file dicocokkan dengan jenisnya. */
    public static Decoded decode(String dataUrl) {
        String value = dataUrl == null ? "" : dataUrl.trim();
        int comma = value.indexOf(',');
        if (!value.startsWith("data:") || comma < 0) {
            throw InputRules.bad("Format gambar tidak dikenali. Pilih ulang gambarnya.");
        }
        String header = value.substring(5, comma).toLowerCase(Locale.ROOT);
        if (!header.endsWith(";base64")) {
            throw InputRules.bad("Format gambar tidak dikenali. Pilih ulang gambarnya.");
        }
        String contentType = header.substring(0, header.length() - ";base64".length());
        if (!CONTENT_TYPES.contains(contentType)) {
            throw InputRules.bad("Gambar harus berformat WebP, JPG, atau PNG.");
        }
        // Perkiraan ukuran sebelum dibaca, supaya kiriman yang terlalu besar langsung ditolak
        long approxBytes = (long) (value.length() - comma - 1) * 3 / 4;
        if (approxBytes > MAX_BYTES + 1024L) {
            throw InputRules.bad("Gambar terlalu besar. Maksimal 3 MB setelah diperkecil.");
        }
        byte[] bytes;
        try {
            bytes = Base64.getMimeDecoder().decode(value.substring(comma + 1));
        } catch (IllegalArgumentException e) {
            throw InputRules.bad("Isi gambar rusak. Pilih ulang gambarnya.");
        }
        if (bytes.length == 0) {
            throw InputRules.bad("Gambar kosong. Pilih ulang gambarnya.");
        }
        if (bytes.length > MAX_BYTES) {
            throw InputRules.bad("Gambar terlalu besar. Maksimal 3 MB setelah diperkecil.");
        }
        if (!matchesType(contentType, bytes)) {
            throw InputRules.bad("File ini bukan gambar yang valid. Pilih gambar WebP, JPG, atau PNG.");
        }
        return new Decoded(contentType, bytes);
    }

    /** Cocokkan beberapa byte pertama file dengan jenis gambarnya. */
    static boolean matchesType(String contentType, byte[] b) {
        switch (contentType) {
            case "image/jpeg":
                return b.length > 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF;
            case "image/png":
                return b.length > 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G'
                        && b[4] == 0x0D && b[5] == 0x0A && b[6] == 0x1A && b[7] == 0x0A;
            case "image/webp":
                return b.length > 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                        && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
            default:
                return false;
        }
    }
}
