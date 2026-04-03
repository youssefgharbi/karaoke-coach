package com.youssef.karaokecoach.media.controller;

import com.youssef.karaokecoach.media.dto.MediaUploadResponse;
import com.youssef.karaokecoach.media.service.MediaStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/media")
public class MediaUploadController {

    private final MediaStorageService mediaStorageService;

    public MediaUploadController(MediaStorageService mediaStorageService) {
        this.mediaStorageService = mediaStorageService;
    }

    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    public MediaUploadResponse upload(@RequestParam("file") MultipartFile file) {
        return mediaStorageService.store(file);
    }
}
