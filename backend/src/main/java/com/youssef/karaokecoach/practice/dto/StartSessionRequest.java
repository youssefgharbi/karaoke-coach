package com.youssef.karaokecoach.practice.dto;

import jakarta.validation.constraints.NotNull;

public record StartSessionRequest(
        @NotNull Long songId,
        Integer transposeSemitones
) {
}
