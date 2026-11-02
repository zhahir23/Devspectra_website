package com.devspectrabackend.repository;

import com.devspectrabackend.model.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    // Urutan di website: sort_order kecil dulu (yang kosong di akhir), lalu yang dibuat lebih dulu
    List<TeamMember> findAllByOrderBySortOrderAscIdAsc();

    boolean existsByPhotoUrl(String photoUrl);
}
