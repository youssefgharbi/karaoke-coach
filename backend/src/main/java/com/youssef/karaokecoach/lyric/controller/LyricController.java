package com.youssef.karaokecoach.lyric.controller;

import com.youssef.karaokecoach.lyric.dto.LyricLineRequest;
import com.youssef.karaokecoach.lyric.dto.LyricLineResponse;
import com.youssef.karaokecoach.lyric.service.LyricService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/songs/{songId}/lyrics")
public class LyricController {

    private final LyricService lyricService;

    public LyricController(LyricService lyricService) {
        this.lyricService = lyricService;
    }

    @GetMapping
    public List<LyricLineResponse> getLyrics(@PathVariable Long songId) {
        return lyricService.findBySongId(songId);
    }

    @PutMapping
    public List<LyricLineResponse> updateLyrics(@PathVariable Long songId,
                                                @Valid @RequestBody List<LyricLineRequest> request) {
        return lyricService.replaceLyrics(songId, request);
    }
}
