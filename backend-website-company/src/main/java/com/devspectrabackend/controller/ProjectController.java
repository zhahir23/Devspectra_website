package com.devspectrabackend.controller;

import com.devspectrabackend.model.Project;
import com.devspectrabackend.service.CurrentUserService;
import com.devspectrabackend.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Projects di halaman Projects website.
 * GET publik (pengunjung hanya mendapat yang Tampil); tambah, ubah, dan hapus butuh JWT.
 */
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping
    public List<Project> list() {
        return projectService.list(currentUserService.isLoggedIn());
    }

    @PostMapping
    public Project create(@RequestBody ProjectService.ProjectRequest request) {
        return projectService.create(request);
    }

    @PutMapping("/{id}")
    public Project update(@PathVariable Long id, @RequestBody ProjectService.ProjectRequest request) {
        return projectService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        projectService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Project berhasil dihapus."));
    }
}
