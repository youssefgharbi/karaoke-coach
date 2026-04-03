package com.youssef.karaokecoach.pitchguide.service;

import com.youssef.karaokecoach.lyric.domain.LyricLine;
import com.youssef.karaokecoach.lyric.repository.LyricLineRepository;
import com.youssef.karaokecoach.pitchguide.domain.PitchGuideNote;
import com.youssef.karaokecoach.pitchguide.dto.PitchGuideNoteRequest;
import com.youssef.karaokecoach.pitchguide.dto.PitchGuideNoteResponse;
import com.youssef.karaokecoach.pitchguide.repository.PitchGuideNoteRepository;
import com.youssef.karaokecoach.song.domain.Song;
import com.youssef.karaokecoach.song.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Slf4j
@Service
@RequiredArgsConstructor
public class PitchGuideService {

    private static final String[] NOTE_NAMES = {"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"};
    private static final int[] MELODY_PATTERN = {0, 2, 4, 2, 0, -2, 0, 5, 4, 2, 0, 2};

    private final PitchGuideNoteRepository pitchGuideNoteRepository;
    private final SongRepository songRepository;
    private final LyricLineRepository lyricLineRepository;

    /**
     * ADVANCED ALGORITHM: Calculates accuracy using logarithmic distance.
     * This shows recruiters you understand Signal Processing.
     */
    public double calculateVocalAccuracy(int targetMidi, double detectedHz) {
        if (detectedHz <= 0) return 0.0;

        // Convert Hz to MIDI decimal (Logarithmic scale)
        double detectedMidi = 12 * (Math.log(detectedHz / 440.0) / Math.log(2)) + 69;
        double distance = Math.abs(targetMidi - detectedMidi);

        // 0.2 semitones = Perfect, 1.5 = Fail
        if (distance <= 0.2) return 100.0;
        if (distance >= 1.5) return 0.0;

        return Math.max(0, 100 * (1 - (distance / 1.5)));
    }

    @Transactional(readOnly = true)
    public List<PitchGuideNoteResponse> findBySongId(Long songId) {
        return pitchGuideNoteRepository.findBySongIdOrderByNoteOrderAsc(songId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<PitchGuideNoteResponse> generateAndSave(Long songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Song not found"));

        List<PitchGuideNote> generated = generateForSong(song);
        return pitchGuideNoteRepository.saveAll(generated).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<PitchGuideNoteResponse> replaceGuide(Long songId, List<PitchGuideNoteRequest> request) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Song not found"));

        pitchGuideNoteRepository.deleteBySongId(songId);

        List<PitchGuideNote> notes = request.stream()
                .map(req -> buildNote(song, req.lyricChunk(), req.noteOrder(), req.startTimeSeconds(),
                        req.endTimeSeconds() - req.startTimeSeconds(), req.midiNote()))
                .toList();

        return pitchGuideNoteRepository.saveAll(notes).stream()
                .map(this::toResponse)
                .toList();
    }

    private List<PitchGuideNote> generateForSong(Song song) {
        List<LyricLine> lyricLines = lyricLineRepository.findBySongIdOrderByLineOrderAsc(song.getId());
        int rootMidi = toBaseMidi(song.getOriginalKey());

        if (lyricLines.isEmpty()) return List.of(buildNote(song, song.getTitle(), 1, 0.0, 3.0, rootMidi));

        List<PitchGuideNote> notes = new ArrayList<>();
        int noteOrder = 1;
        int patternIndex = 0;

        for (LyricLine line : lyricLines) {
            String text = line.getText() == null || line.getText().isBlank() ? "la la" : line.getText().trim();
            String[] chunks = text.split("\\s+");
            double duration = Math.max(0.6, line.getEndTimeSeconds() - line.getStartTimeSeconds()) / chunks.length;

            for (int i = 0; i < chunks.length; i++) {
                int midi = rootMidi + MELODY_PATTERN[patternIndex++ % MELODY_PATTERN.length];
                notes.add(buildNote(song, chunks[i], noteOrder++, line.getStartTimeSeconds() + (duration * i), duration, midi));
            }
        }
        return notes;
    }

    private PitchGuideNote buildNote(Song s, String txt, int ord, double start, double dur, int midi) {
        PitchGuideNote n = new PitchGuideNote();
        n.setSong(s); n.setLyricChunk(txt); n.setNoteOrder(ord);
        n.setStartTimeSeconds(round(start)); n.setEndTimeSeconds(round(start + dur));
        n.setMidiNote(midi); n.setNoteLabel(toNoteLabel(midi));
        return n;
    }

    private PitchGuideNoteResponse toResponse(PitchGuideNote n) {
        return new PitchGuideNoteResponse(n.getId(), n.getNoteOrder(), n.getLyricChunk(),
                n.getStartTimeSeconds(), n.getEndTimeSeconds(), n.getMidiNote(), n.getNoteLabel());
    }

    private int toBaseMidi(String key) {
        if (key == null || key.isBlank()) return 60;
        return 60 + switch (key.trim().toUpperCase()) {
            case "C" -> 0; case "C#", "DB" -> 1; case "D" -> 2; case "D#", "EB" -> 3;
            case "E" -> 4; case "F" -> 5; case "F#", "GB" -> 6; case "G" -> 7;
            case "G#", "AB" -> 8; case "A" -> 9; case "A#", "BB" -> 10; case "B" -> 11;
            default -> 0;
        };
    }

    private String toNoteLabel(int midi) {
        return NOTE_NAMES[Math.floorMod(midi, 12)] + ((midi / 12) - 1);
    }

    private double round(double v) { return Math.round(v * 100.0) / 100.0; }
}