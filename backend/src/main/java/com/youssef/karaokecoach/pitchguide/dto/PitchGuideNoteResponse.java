package com.youssef.karaokecoach.pitchguide.dto;

public record PitchGuideNoteResponse(
        Long id,
        Integer noteOrder,
        String lyricChunk,
        Double startTimeSeconds,
        Double endTimeSeconds,
        Integer midiNote,
        String noteLabel
) {
}
