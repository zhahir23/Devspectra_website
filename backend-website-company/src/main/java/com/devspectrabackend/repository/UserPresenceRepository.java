package com.devspectrabackend.repository;

import com.devspectrabackend.model.UserPresence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserPresenceRepository extends JpaRepository<UserPresence, Long> {
}
