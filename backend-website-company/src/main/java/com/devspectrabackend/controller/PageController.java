package com.devspectrabackend.controller;

import com.devspectrabackend.model.Page;
import com.devspectrabackend.service.PageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pages")
public class PageController {

    @Autowired
    private PageService pageService;

    @GetMapping
    public List<Page> getAllPages() {
        return pageService.getAllPages();
    }

    @PostMapping
    public Page createPage(@RequestBody Page page) {
        return pageService.createPage(page);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Page> getPageById(@PathVariable Long id) {
        Page page = pageService.getPageById(id)
                .orElseThrow(() -> new RuntimeException("Page not found with id: " + id));
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Page> updatePage(@PathVariable Long id, @RequestBody Page details) {
        return ResponseEntity.ok(pageService.updatePage(id, details));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePage(@PathVariable Long id) {
        pageService.deletePage(id);
        return ResponseEntity.ok("Page successfully deleted!");
    }
}