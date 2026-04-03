package com.youssef.karaokecoach.lyric.repository;

import com.youssef.karaokecoach.lyric.domain.LyricLine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LyricLineRepository extends JpaRepository<LyricLine, Long> {

    List<LyricLine> findBySongIdOrderByLineOrderAsc(Long songId);

    void deleteBySongId(Long songId);
}
