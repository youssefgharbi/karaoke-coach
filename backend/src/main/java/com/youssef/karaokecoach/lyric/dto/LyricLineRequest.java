package com.youssef.karaokecoach.lyric.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LyricLineRequest(
        @NotNull Integer lineOrder,
        @NotBlank String text,
        @NotNull Double startTimeSeconds,
        @NotNull Double endTimeSeconds
) {
}
