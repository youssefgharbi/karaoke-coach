package com.youssef.karaokecoach.practice.service;

import com.youssef.karaokecoach.practice.domain.PracticeSession;
import com.youssef.karaokecoach.practice.dto.CompleteSessionRequest;
import com.youssef.karaokecoach.practice.dto.PracticeSessionResponse;
import com.youssef.karaokecoach.practice.dto.StartSessionRequest;
import com.youssef.karaokecoach.practice.repository.PracticeSessionRepository;
import com.youssef.karaokecoach.song.domain.Song;
import com.youssef.karaokecoach.song.repository.SongRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class PracticeSessionService {

    private final PracticeSessionRepository practiceSessionRepository;
    private final SongRepository songRepository;

    public PracticeSessionService(PracticeSessionRepository practiceSessionRepository,
                                  SongRepository songRepository) {
        this.practiceSessionRepository = practiceSessionRepository;
        this.songRepository = songRepository;
    }

    public List<PracticeSessionResponse> findAll() {
        return practiceSessionRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public PracticeSessionResponse start(StartSessionRequest request) {
        Song song = songRepository.findById(request.songId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Song not found"));

        PracticeSession session = new PracticeSession();
        session.setSong(song);
        session.setTransposeSemitones(request.transposeSemitones() == null ? 0 : request.transposeSemitones());

        return toResponse(practiceSessionRepository.save(session));
    }

    public PracticeSessionResponse complete(Long sessionId, CompleteSessionRequest request) {
        PracticeSession session = practiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Practice session not found"));

        session.setAveragePitchScore(request.averagePitchScore());
        session.setFlatMoments(request.flatMoments());
        session.setSharpMoments(request.sharpMoments());
        session.setNotes(request.notes());

        return toResponse(practiceSessionRepository.save(session));
    }

    private PracticeSessionResponse toResponse(PracticeSession session) {
        return new PracticeSessionResponse(
                session.getId(),
                session.getSong() != null ? session.getSong().getId() : null,
                session.getTransposeSemitones(),
                session.getAveragePitchScore(),
                session.getFlatMoments(),
                session.getSharpMoments(),
                session.getNotes()
        );
    }
}
