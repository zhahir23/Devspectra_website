package com.devspectrabackend.service;

import com.devspectrabackend.model.TeamMember;
import com.devspectrabackend.model.User;
import com.devspectrabackend.repository.TeamMemberRepository;
import com.devspectrabackend.support.ApiException;
import com.devspectrabackend.support.InputRules;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Anggota tim yang tampil di website (halaman Divisi, "Tim Kami" di beranda, pilihan anggota di Contact),
 * dikelola dari dashboard (Konten website > Divisi). Semua anggota yang login boleh mengubah,
 * sama seperti Layanan dan Testimoni.
 */
@Service
public class TeamMemberService {

    // Sama dengan pilihan di menu Divisi di website (app/components/DivisiFilter.tsx)
    public static final List<String> DIVISIONS = List.of("IT", "Media", "Marketing");

    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private MediaService mediaService;

    @Autowired
    private CurrentUserService currentUserService;

    /**
     * Isi dari dashboard. Foto baru dikirim di photoData (data URL);
     * photoUrl null = foto tidak berubah, photoUrl "" = foto dihapus (kembali memakai inisial).
     */
    public record TeamMemberRequest(
            String name,
            String role,
            String division,
            String email,
            String initials,
            String photoUrl,
            String photoData,
            Integer sortOrder,
            Boolean showOnHome,
            Boolean showInDivision,
            Boolean showInContact) {
    }

    /** Pengunjung website hanya mendapat anggota yang tampil di website; dashboard (login) mendapat semuanya. */
    @Transactional(readOnly = true)
    public List<TeamMember> list(boolean includeHidden) {
        List<TeamMember> all = teamMemberRepository.findAllByOrderBySortOrderAscIdAsc();
        if (includeHidden) return all;
        return all.stream().filter(TeamMember::shownAnywhere).toList();
    }

    @Transactional
    public TeamMember create(TeamMemberRequest request) {
        User me = currentUserService.require();
        TeamMember member = new TeamMember();
        apply(member, request, me);
        if (member.getSortOrder() == null) {
            member.setSortOrder(nextSortOrder());
        }
        return teamMemberRepository.save(member);
    }

    @Transactional
    public TeamMember update(Long id, TeamMemberRequest request) {
        User me = currentUserService.require();
        TeamMember member = find(id);
        String oldPhoto = member.getPhotoUrl();
        apply(member, request, me);
        TeamMember saved = teamMemberRepository.saveAndFlush(member);
        if (oldPhoto != null && !oldPhoto.equals(saved.getPhotoUrl())) {
            mediaService.deleteIfUnused(oldPhoto);
        }
        return saved;
    }

    @Transactional
    public void delete(Long id) {
        currentUserService.require();
        TeamMember member = find(id);
        String photo = member.getPhotoUrl();
        teamMemberRepository.delete(member);
        teamMemberRepository.flush();
        mediaService.deleteIfUnused(photo);
    }

    private TeamMember find(Long id) {
        return teamMemberRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "Anggota tim tidak ditemukan. Mungkin sudah dihapus anggota lain, muat ulang halaman."));
    }

    private void apply(TeamMember member, TeamMemberRequest request, User me) {
        if (request == null) throw InputRules.bad("Data anggota tim kosong.");
        String name = InputRules.required(request.name(), 150,
                "Nama wajib diisi.", "Nama maksimal 150 karakter.");
        member.setName(name);
        member.setRole(InputRules.optional(request.role(), 200, "Posisi maksimal 200 karakter."));
        member.setDivision(InputRules.oneOf(request.division(), DIVISIONS,
                "Divisi harus IT, Media, atau Marketing."));

        String email = InputRules.optional(request.email(), 150, "Email maksimal 150 karakter.");
        if (email != null && !EMAIL.matcher(email).matches()) {
            throw InputRules.bad("Format email belum benar, contoh: nama@devspectra.com");
        }
        member.setEmail(email == null ? null : email.toLowerCase(Locale.ROOT));

        String initials = InputRules.clean(request.initials());
        if (initials != null && initials.length() > 3) {
            throw InputRules.bad("Inisial maksimal 3 huruf.");
        }
        member.setInitials(initials == null ? initialsOf(name) : initials.toUpperCase(Locale.ROOT));

        if (request.sortOrder() != null) {
            member.setSortOrder(request.sortOrder());
        }
        member.setShowOnHome(request.showOnHome() == null ? Boolean.TRUE : request.showOnHome());
        member.setShowInDivision(request.showInDivision() == null ? Boolean.TRUE : request.showInDivision());
        member.setShowInContact(request.showInContact() == null ? Boolean.TRUE : request.showInContact());
        member.setPhotoUrl(mediaService.resolveImage(member.getPhotoUrl(), request.photoUrl(),
                request.photoData(), me.getEmail()));
    }

    /** "Bagus Adi Wibowo" -> "BW", "Rasya" -> "RA". Sama dengan dashboard (src/lib/websiteContent.js). */
    static String initialsOf(String name) {
        String[] words = name.trim().split("\\s+");
        String first = words[0];
        String result;
        if (words.length == 1) {
            result = first.length() >= 2 ? first.substring(0, 2) : first;
        } else {
            String last = words[words.length - 1];
            result = first.substring(0, 1) + last.substring(0, 1);
        }
        return result.toUpperCase(Locale.ROOT);
    }

    private int nextSortOrder() {
        return teamMemberRepository.findAll().stream()
                .map(TeamMember::getSortOrder)
                .filter(Objects::nonNull)
                .max(Integer::compare)
                .orElse(0) + 1;
    }
}
