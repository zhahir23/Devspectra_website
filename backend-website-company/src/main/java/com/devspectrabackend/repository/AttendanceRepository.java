package com.devspectrabackend.repository;

import com.devspectrabackend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByWorkDate(LocalDate workDate);

    Optional<Attendance> findByUserIdAndWorkDate(Long userId, LocalDate workDate);

    List<Attendance> findByWorkDateBetween(LocalDate from, LocalDate to);
}
