package com.devspectrabackend.service;

import com.devspectrabackend.model.Project;
import com.devspectrabackend.model.User;
import com.devspectrabackend.repository.ProjectRepository;
import com.devspectrabackend.support.ApiException;
import com.devspectrabackend.support.InputRules;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Projects di halaman Projects website, dikelola dari dashboard (Konten website > Projects).
 * Semua anggota yang login boleh menambah, mengubah, dan menghapus, sama seperti Layanan dan Testimoni.
 */
@Service
public class ProjectService {

    // Sama dengan pilihan di menu Projects di website (app/components/ProjectFilter.tsx)
    public static final List<String> CATEGORIES = List.of("IT", "Media");
    public static final List<String> STATUSES = List.of("active", "archived");

    private static final int MAX_TAGS = 10;
    private static final int MAX_TAG_LENGTH = 40;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private MediaService mediaService;

    @Autowired
    private CurrentUserService currentUserService;

    /**
     * Isi dari dashboard. Gambar baru dikirim di imageData (data URL); imageUrl null = gambar tidak berubah.
     */
    public record ProjectRequest(
            String title,
            String description,
            String category,
            String status,
            String tags,
            String imageUrl,
            String imageData,
            String canvaUrl,
            Integer sortOrder,
            @JsonProperty("isActive") Boolean isActive) {
    }

    /** Pengunjung website hanya mendapat project yang ditampilkan; dashboard (login) mendapat semuanya. */
    @Transactional(readOnly = true)
    public List<Project> list(boolean includeHidden) {
        List<Project> all = projectRepository.findAllByOrderBySortOrderAscIdAsc();
        if (includeHidden) return all;
        return all.stream().filter(p -> !Boolean.FALSE.equals(p.getIsActive())).toList();
    }

    @Transactional
    public Project create(ProjectRequest request) {
        User me = currentUserService.require();
        Project project = new Project();
        apply(project, request, me);
        if (project.getSortOrder() == null) {
            project.setSortOrder(nextSortOrder());
        }
        return projectRepository.save(project);
    }

    @Transactional
    public Project update(Long id, ProjectRequest request) {
        User me = currentUserService.require();
        Project project = find(id);
        String oldImage = project.getImageUrl();
        apply(project, request, me);
        Project saved = projectRepository.saveAndFlush(project);
        if (oldImage != null && !oldImage.equals(saved.getImageUrl())) {
            mediaService.deleteIfUnused(oldImage);
        }
        return saved;
    }

    @Transactional
    public void delete(Long id) {
        currentUserService.require();
        Project project = find(id);
        String image = project.getImageUrl();
        projectRepository.delete(project);
        projectRepository.flush();
        mediaService.deleteIfUnused(image);
    }

    private Project find(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "Project tidak ditemukan. Mungkin sudah dihapus anggota lain, muat ulang halaman."));
    }

    private void apply(Project project, ProjectRequest request, User me) {
        if (request == null) throw InputRules.bad("Data project kosong.");
        project.setTitle(InputRules.required(request.title(), 150,
                "Judul project wajib diisi.", "Judul project maksimal 150 karakter."));
        project.setDescription(InputRules.optional(request.description(), 2000,
                "Deskripsi maksimal 2000 karakter."));
        project.setCategory(InputRules.oneOf(request.category(), CATEGORIES,
                "Kategori harus IT atau Media."));
        project.setStatus(InputRules.clean(request.status()) == null
                ? "active"
                : InputRules.oneOf(request.status(), STATUSES, "Status harus active atau archived."));
        project.setTags(normalizeTags(request.tags()));
        project.setCanvaUrl(InputRules.httpUrl(request.canvaUrl(), 500,
                "Link Canva harus berupa alamat lengkap yang diawali https://"));
        if (request.sortOrder() != null) {
            project.setSortOrder(request.sortOrder());
        }
        project.setIsActive(request.isActive() == null ? Boolean.TRUE : request.isActive());
        project.setImageUrl(mediaService.resolveImage(project.getImageUrl(), request.imageUrl(),
                request.imageData(), me.getEmail()));
    }

    /** "UI/UX,  Mobile ,Figma," -> "UI/UX, Mobile, Figma". Kosong -> null. */
    static String normalizeTags(String tags) {
        String text = InputRules.clean(tags);
        if (text == null) return null;
        List<String> list = new ArrayList<>();
        for (String part : text.split(",")) {
            String tag = part.trim();
            if (tag.isEmpty() || list.stream().anyMatch(t -> t.equalsIgnoreCase(tag))) continue;
            if (tag.length() > MAX_TAG_LENGTH) {
                throw InputRules.bad("Satu tag maksimal " + MAX_TAG_LENGTH + " karakter: \"" + tag + "\".");
            }
            list.add(tag);
        }
        if (list.size() > MAX_TAGS) {
            throw InputRules.bad("Tag maksimal " + MAX_TAGS + ".");
        }
        return list.isEmpty() ? null : String.join(", ", list);
    }

    private int nextSortOrder() {
        return projectRepository.findAll().stream()
                .map(Project::getSortOrder)
                .filter(Objects::nonNull)
                .max(Integer::compare)
                .orElse(0) + 1;
    }
}
