package com.youssef.karaokecoach.pitchguide.repository;

import com.youssef.karaokecoach.pitchguide.domain.PitchGuideNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PitchGuideNoteRepository extends JpaRepository<PitchGuideNote, Long> {

    List<PitchGuideNote> findBySongIdOrderByNoteOrderAsc(Long songId);

    void deleteBySongId(Long songId);
}
