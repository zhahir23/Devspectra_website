package com.devspectrabackend.service;

import com.devspectrabackend.model.Page;
import com.devspectrabackend.repository.PageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PageServiceImpl implements PageService {

    @Autowired
    private PageRepository pageRepository;

    @Override
    public List<Page> getAllPages() {
        return pageRepository.findAll();
    }

    @Override
    public Optional<Page> getPageById(Long id) {
        return pageRepository.findById(id);
    }

    @Override
    public Page createPage(Page page) {
        return pageRepository.save(page);
    }

    @Override
    public Page updatePage(Long id, Page pageDetails) {
        Page page = pageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Page not found with id: " + id));
        page.setTitle(pageDetails.getTitle());
        page.setSlug(pageDetails.getSlug());
        page.setContent(pageDetails.getContent());
        return pageRepository.save(page);
    }

    @Override
    public void deletePage(Long id) {
        Page page = pageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Page not found with id: " + id));
        pageRepository.delete(page);
    }
}