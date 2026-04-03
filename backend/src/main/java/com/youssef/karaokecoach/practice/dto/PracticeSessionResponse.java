package com.youssef.karaokecoach.practice.dto;

public record PracticeSessionResponse(
        Long id,
        Long songId,
        Integer transposeSemitones,
        Double averagePitchScore,
        Integer flatMoments,
        Integer sharpMoments,
        String notes
) {
}
