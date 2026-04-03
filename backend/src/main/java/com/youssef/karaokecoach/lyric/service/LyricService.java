package com.youssef.karaokecoach.lyric.service;

import com.youssef.karaokecoach.lyric.domain.LyricLine;
import com.youssef.karaokecoach.lyric.dto.LyricLineRequest;
import com.youssef.karaokecoach.lyric.dto.LyricLineResponse;
import com.youssef.karaokecoach.lyric.repository.LyricLineRepository;
import com.youssef.karaokecoach.pitchguide.repository.PitchGuideNoteRepository;
import com.youssef.karaokecoach.song.domain.Song;
import com.youssef.karaokecoach.song.repository.SongRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class LyricService {

    private final LyricLineRepository lyricLineRepository;
    private final SongRepository songRepository;
    private final PitchGuideNoteRepository pitchGuideNoteRepository;

    public LyricService(LyricLineRepository lyricLineRepository,
                        SongRepository songRepository,
                        PitchGuideNoteRepository pitchGuideNoteRepository) {
        this.lyricLineRepository = lyricLineRepository;
        this.songRepository = songRepository;
        this.pitchGuideNoteRepository = pitchGuideNoteRepository;
    }

    public List<LyricLineResponse> findBySongId(Long songId) {
        return lyricLineRepository.findBySongIdOrderByLineOrderAsc(songId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<LyricLineResponse> replaceLyrics(Long songId, List<LyricLineRequest> request) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Song not found"));

        lyricLineRepository.deleteBySongId(songId);
        pitchGuideNoteRepository.deleteBySongId(songId);

        List<LyricLine> lines = request.stream()
                .map(line -> toEntity(song, line))
                .toList();

        return lyricLineRepository.saveAll(lines).stream()
                .map(this::toResponse)
                .toList();
    }

    private LyricLine toEntity(Song song, LyricLineRequest request) {
        LyricLine lyricLine = new LyricLine();
        lyricLine.setSong(song);
        lyricLine.setLineOrder(request.lineOrder());
        lyricLine.setText(request.text().trim());
        lyricLine.setStartTimeSeconds(request.startTimeSeconds());
        lyricLine.setEndTimeSeconds(request.endTimeSeconds());
        return lyricLine;
    }

    private LyricLineResponse toResponse(LyricLine line) {
        return new LyricLineResponse(
                line.getId(),
                line.getLineOrder(),
                line.getText(),
                line.getStartTimeSeconds(),
                line.getEndTimeSeconds()
        );
    }
}
