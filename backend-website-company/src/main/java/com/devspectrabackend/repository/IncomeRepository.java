package com.devspectrabackend.repository;

import com.devspectrabackend.model.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {

    // Yang terbaru di atas
    List<Income> findAllByOrderByReceivedOnDescIdDesc();
}
