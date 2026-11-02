package com.devspectrabackend.controller;

import com.devspectrabackend.model.TeamMember;
import com.devspectrabackend.service.CurrentUserService;
import com.devspectrabackend.service.TeamMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Anggota tim di website (halaman Divisi, "Tim Kami" di beranda, pilihan anggota di Contact).
 * GET publik (pengunjung hanya mendapat yang tampil di website); tambah, ubah, dan hapus butuh JWT.
 */
@RestController
@RequestMapping("/api/team-members")
public class TeamMemberController {

    @Autowired
    private TeamMemberService teamMemberService;

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping
    public List<TeamMember> list() {
        return teamMemberService.list(currentUserService.isLoggedIn());
    }

    @PostMapping
    public TeamMember create(@RequestBody TeamMemberService.TeamMemberRequest request) {
        return teamMemberService.create(request);
    }

    @PutMapping("/{id}")
    public TeamMember update(@PathVariable Long id, @RequestBody TeamMemberService.TeamMemberRequest request) {
        return teamMemberService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        teamMemberService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Anggota tim berhasil dihapus."));
    }
}
