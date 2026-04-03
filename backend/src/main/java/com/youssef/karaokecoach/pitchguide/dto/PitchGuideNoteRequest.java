package com.youssef.karaokecoach.pitchguide.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PitchGuideNoteRequest(
        @NotNull Integer noteOrder,
        @NotBlank String lyricChunk,
        @NotNull Double startTimeSeconds,
        @NotNull Double endTimeSeconds,
        @NotNull Integer midiNote,
        @NotBlank String noteLabel
) {
}
