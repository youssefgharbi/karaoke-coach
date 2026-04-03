package com.youssef.karaokecoach.practice.dto;

public record CompleteSessionRequest(
        Double averagePitchScore,
        Integer flatMoments,
        Integer sharpMoments,
        String notes
) {
}
