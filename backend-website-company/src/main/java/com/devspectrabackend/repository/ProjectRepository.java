package com.devspectrabackend.repository;

import com.devspectrabackend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Urutan di website: sort_order kecil dulu (yang kosong di akhir), lalu yang dibuat lebih dulu
    List<Project> findAllByOrderBySortOrderAscIdAsc();

    boolean existsByImageUrl(String imageUrl);
}
