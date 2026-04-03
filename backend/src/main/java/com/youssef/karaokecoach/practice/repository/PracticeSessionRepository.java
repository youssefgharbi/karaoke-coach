package com.youssef.karaokecoach.practice.repository;

import com.youssef.karaokecoach.practice.domain.PracticeSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PracticeSessionRepository extends JpaRepository<PracticeSession, Long> {
}
