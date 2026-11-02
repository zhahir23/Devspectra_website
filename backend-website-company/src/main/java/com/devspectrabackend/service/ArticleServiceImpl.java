package com.devspectrabackend.service;

import com.devspectrabackend.model.Article;
import com.devspectrabackend.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ArticleServiceImpl implements ArticleService {

    @Autowired
    private ArticleRepository articleRepository;

    @Override
    public List<Article> getAllArticles() {
        return articleRepository.findAll();
    }

    @Override
    public Optional<Article> getArticleById(Long id) {
        return articleRepository.findById(id);
    }

    @Override
    public Article createArticle(Article article) {
        return articleRepository.save(article);
    }

    @Override
    public Article updateArticle(Long id, Article articleDetails) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found with id: " + id));

        article.setTitle(articleDetails.getTitle());
        article.setSlug(articleDetails.getSlug());
        article.setContent(articleDetails.getContent());
        article.setAuthor(articleDetails.getAuthor());

        return articleRepository.save(article);
    }

    @Override
    public void deleteArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found with id: " + id));
        articleRepository.delete(article);
    }
}