package com.youssef.karaokecoach.song.dto;

public record SongResponse(
        Long id,
        String title,
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
