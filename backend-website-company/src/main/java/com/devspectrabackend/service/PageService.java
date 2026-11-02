package com.devspectrabackend.service;

import com.devspectrabackend.model.Page;
import java.util.List;
import java.util.Optional;

public interface PageService {
    List<Page> getAllPages();
    Optional<Page> getPageById(Long id);
    Page createPage(Page page);
    Page updatePage(Long id, Page pageDetails);
    void deletePage(Long id);
}