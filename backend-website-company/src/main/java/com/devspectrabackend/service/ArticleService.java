package com.devspectrabackend.service;

import com.devspectrabackend.model.Article;
import java.util.List;
import java.util.Optional;

public interface ArticleService {
    List<Article> getAllArticles();
    Optional<Article> getArticleById(Long id);
    Article createArticle(Article article);
    Article updateArticle(Long id, Article articleDetails);
    void deleteArticle(Long id);
}