package com.youssef.karaokecoach.lyric.dto;

public record LyricLineResponse(
        Long id,
        Integer lineOrder,
        String text,
        Double startTimeSeconds,
        Double endTimeSeconds
) {
}
