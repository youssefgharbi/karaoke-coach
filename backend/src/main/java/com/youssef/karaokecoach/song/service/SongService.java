package com.youssef.karaokecoach.song.service;

import com.youssef.karaokecoach.lyric.repository.LyricLineRepository;
import com.youssef.karaokecoach.pitchguide.repository.PitchGuideNoteRepository;
import com.youssef.karaokecoach.song.domain.Song;
import com.youssef.karaokecoach.song.dto.SongRequest;
import com.youssef.karaokecoach.song.dto.SongResponse;
import com.youssef.karaokecoach.song.repository.SongRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class SongService {

    private final SongRepository songRepository;
    private final LyricLineRepository lyricLineRepository;
    private final PitchGuideNoteRepository pitchGuideNoteRepository;

    public SongService(SongRepository songRepository,
                       LyricLineRepository lyricLineRepository,
                       PitchGuideNoteRepository pitchGuideNoteRepository) {
        this.songRepository = songRepository;
        this.lyricLineRepository = lyricLineRepository;
        this.pitchGuideNoteRepository = pitchGuideNoteRepository;
    }

    public List<SongResponse> findAll() {
        return songRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public SongResponse findById(Long songId) {
        return toResponse(getSong(songId));
    }

    public SongResponse create(SongRequest request) {
        Song song = new Song();
        applyRequest(song, request);
        return toResponse(songRepository.save(song));
    }

    public SongResponse update(Long songId, SongRequest request) {
        Song song = getSong(songId);
        boolean originalKeyChanged = !Objects.equals(song.getOriginalKey(), request.originalKey());
        applyRequest(song, request);
        Song savedSong = songRepository.save(song);

        if (originalKeyChanged) {
            pitchGuideNoteRepository.deleteBySongId(songId);
        }

        return toResponse(savedSong);
    }

    public void delete(Long songId) {
        pitchGuideNoteRepository.deleteBySongId(songId);
        lyricLineRepository.deleteBySongId(songId);
        songRepository.deleteById(songId);
    }

    private Song getSong(Long songId) {
        return songRepository.findById(songId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Song not found"));
    }

    private void applyRequest(Song song, SongRequest request) {
        song.setTitle(request.title());
        song.setArtist(request.artist());
        song.setOriginalKey(request.originalKey());
        song.setBpm(request.bpm());
        song.setAudioUrl(request.audioUrl());
        song.setMediaUrl(request.mediaUrl());
        song.setMediaType(request.mediaType());
        song.setCoverImageUrl(request.coverImageUrl());
        song.setSpotifyTrackId(request.spotifyTrackId());
        song.setYoutubeKaraokeUrl(request.youtubeKaraokeUrl());
    }

    private SongResponse toResponse(Song song) {
        return new SongResponse(
                song.getId(),
                song.getTitle(),
                song.getArtist(),
                song.getOriginalKey(),
                song.getBpm(),
                song.getAudioUrl(),
                song.getMediaUrl(),
                song.getMediaType(),
                song.getCoverImageUrl(),
                song.getSpotifyTrackId(),
                song.getYoutubeKaraokeUrl()
        );
    }
}
