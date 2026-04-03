package com.youssef.karaokecoach.pitchguide.service;

import com.youssef.karaokecoach.lyric.domain.LyricLine;
import com.youssef.karaokecoach.lyric.repository.LyricLineRepository;
import com.youssef.karaokecoach.pitchguide.domain.PitchGuideNote;
import com.youssef.karaokecoach.pitchguide.dto.PitchGuideNoteRequest;
import com.youssef.karaokecoach.pitchguide.dto.PitchGuideNoteResponse;
import com.youssef.karaokecoach.pitchguide.repository.PitchGuideNoteRepository;
import com.youssef.karaokecoach.song.domain.Song;
import com.youssef.karaokecoach.song.repository.SongRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class PitchGuideService {

    private static final String[] NOTE_NAMES = {"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"};
    private static final int[] MELODY_PATTERN = {0, 2, 4, 2, 0, -2, 0, 5, 4, 2, 0, 2};

    private final PitchGuideNoteRepository pitchGuideNoteRepository;
    private final SongRepository songRepository;
    private final LyricLineRepository lyricLineRepository;

    public PitchGuideService(PitchGuideNoteRepository pitchGuideNoteRepository,
                             SongRepository songRepository,
                             LyricLineRepository lyricLineRepository) {
        this.pitchGuideNoteRepository = pitchGuideNoteRepository;
        this.songRepository = songRepository;
        this.lyricLineRepository = lyricLineRepository;
    }

    @Transactional
    public List<PitchGuideNoteResponse> findBySongId(Long songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Song not found"));

        List<PitchGuideNote> existing = pitchGuideNoteRepository.findBySongIdOrderByNoteOrderAsc(songId);
        if (!existing.isEmpty()) {
            return existing.stream().map(this::toResponse).toList();
        }

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
                .map(note -> toEntity(song, note))
                .toList();

        return pitchGuideNoteRepository.saveAll(notes).stream()
                .map(this::toResponse)
                .toList();
    }

    private List<PitchGuideNote> generateForSong(Song song) {
        List<LyricLine> lyricLines = lyricLineRepository.findBySongIdOrderByLineOrderAsc(song.getId());
        int rootMidi = toBaseMidi(song.getOriginalKey());

        if (lyricLines.isEmpty()) {
            PitchGuideNote fallback = new PitchGuideNote();
            fallback.setSong(song);
            fallback.setNoteOrder(1);
            fallback.setLyricChunk(song.getTitle());
            fallback.setStartTimeSeconds(0.0);
            fallback.setEndTimeSeconds(3.0);
            fallback.setMidiNote(rootMidi);
            fallback.setNoteLabel(toNoteLabel(rootMidi));
            return List.of(fallback);
        }

        List<PitchGuideNote> notes = new ArrayList<>();
        int noteOrder = 1;
        int patternIndex = 0;

        for (LyricLine line : lyricLines) {
            String sourceText = line.getText() == null || line.getText().isBlank() ? "la la" : line.getText().trim();
            String[] chunks = sourceText.split("\\s+");
            int chunkCount = Math.max(1, chunks.length);
            double totalDuration = Math.max(0.6, line.getEndTimeSeconds() - line.getStartTimeSeconds());
            double chunkDuration = totalDuration / chunkCount;

            for (int index = 0; index < chunkCount; index += 1) {
                PitchGuideNote note = new PitchGuideNote();
                note.setSong(song);
                note.setNoteOrder(noteOrder++);
                note.setLyricChunk(chunks[index]);

                double start = line.getStartTimeSeconds() + chunkDuration * index;
                double end = index == chunkCount - 1 ? line.getEndTimeSeconds() : start + chunkDuration;

                note.setStartTimeSeconds(round(start));
                note.setEndTimeSeconds(round(end));

                int midiNote = rootMidi + MELODY_PATTERN[patternIndex % MELODY_PATTERN.length];
                note.setMidiNote(midiNote);
                note.setNoteLabel(toNoteLabel(midiNote));

                notes.add(note);
                patternIndex += 1;
            }
        }

        return notes;
    }

    private PitchGuideNote toEntity(Song song, PitchGuideNoteRequest request) {
        PitchGuideNote note = new PitchGuideNote();
        note.setSong(song);
        note.setNoteOrder(request.noteOrder());
        note.setLyricChunk(request.lyricChunk().trim());
        note.setStartTimeSeconds(round(request.startTimeSeconds()));
        note.setEndTimeSeconds(round(request.endTimeSeconds()));
        note.setMidiNote(request.midiNote());
        note.setNoteLabel(request.noteLabel().trim());
        return note;
    }

    private PitchGuideNoteResponse toResponse(PitchGuideNote note) {
        return new PitchGuideNoteResponse(
                note.getId(),
                note.getNoteOrder(),
                note.getLyricChunk(),
                note.getStartTimeSeconds(),
                note.getEndTimeSeconds(),
                note.getMidiNote(),
                note.getNoteLabel()
        );
    }

    private int toBaseMidi(String originalKey) {
        if (originalKey == null || originalKey.isBlank()) {
            return 60;
        }

        String normalized = originalKey.trim().toUpperCase();
        int semitone = switch (normalized) {
            case "C" -> 0;
            case "C#", "DB" -> 1;
            case "D" -> 2;
            case "D#", "EB" -> 3;
            case "E" -> 4;
            case "F" -> 5;
            case "F#", "GB" -> 6;
            case "G" -> 7;
            case "G#", "AB" -> 8;
            case "A" -> 9;
            case "A#", "BB" -> 10;
            case "B" -> 11;
            default -> 0;
        };

        return 60 + semitone;
    }

    private String toNoteLabel(int midiNote) {
        int noteIndex = Math.floorMod(midiNote, 12);
        int octave = (midiNote / 12) - 1;
        return NOTE_NAMES[noteIndex] + octave;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
