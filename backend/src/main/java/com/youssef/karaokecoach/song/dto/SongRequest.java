package com.youssef.karaokecoach.song.dto;

import jakarta.validation.constraints.NotBlank;

public record SongRequest(
        @NotBlank String title,
        String artist,
        String originalKey,
        Integer bpm,
        String audioUrl,
        String mediaUrl,
        String mediaType,
        String coverImageUrl,
        String spotifyTrackId,
        String youtubeKaraokeUrl
) {
}
