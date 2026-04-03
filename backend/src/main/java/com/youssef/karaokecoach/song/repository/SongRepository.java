package com.youssef.karaokecoach.song.repository;

import com.youssef.karaokecoach.song.domain.Song;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SongRepository extends JpaRepository<Song, Long> {
}
