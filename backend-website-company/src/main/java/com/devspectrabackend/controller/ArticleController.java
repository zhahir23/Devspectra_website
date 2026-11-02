package com.devspectrabackend.controller;

import com.devspectrabackend.model.Article;
import com.devspectrabackend.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    // GET: Ambil semua artikel
    @GetMapping
    public List<Article> getAllArticles() {
        return articleService.getAllArticles();
    }

    // POST: Tambah artikel baru
    @PostMapping
    public Article createArticle(@RequestBody Article article) {
        return articleService.createArticle(article);
    }

    // GET by ID: Ambil artikel berdasarkan ID
    @GetMapping("/{id}")
    public ResponseEntity<Article> getArticleById(@PathVariable Long id) {
        Article article = articleService.getArticleById(id)
                .orElseThrow(() -> new RuntimeException("Article not found with id: " + id));
        return ResponseEntity.ok(article);
    }

    // PUT: Update artikel
    @PutMapping("/{id}")
    public ResponseEntity<Article> updateArticle(@PathVariable Long id, @RequestBody Article articleDetails) {
        Article updatedArticle = articleService.updateArticle(id, articleDetails);
        return ResponseEntity.ok(updatedArticle);
    }

    // DELETE: Hapus artikel
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.ok("Article successfully deleted!");
    }
}