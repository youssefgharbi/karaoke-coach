package com.youssef.karaokecoach.auth.dto;

public record AuthResponse(
        Long userId,
        String displayName,
        String email,
        String accessToken
) {
}
