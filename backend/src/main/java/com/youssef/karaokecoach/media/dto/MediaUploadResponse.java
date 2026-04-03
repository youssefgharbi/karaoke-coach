package com.youssef.karaokecoach.media.dto;

public record MediaUploadResponse(
        String mediaUrl,
        String mediaType,
        String originalFileName
) {
}
