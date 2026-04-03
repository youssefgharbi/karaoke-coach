package com.youssef.karaokecoach.song.controller;

import com.youssef.karaokecoach.song.dto.SongRequest;
import com.youssef.karaokecoach.song.dto.SongResponse;
import com.youssef.karaokecoach.song.service.SongService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
public class SongController {

    private final SongService songService;

    public SongController(SongService songService) {
        this.songService = songService;
    }

    @GetMapping
    public List<SongResponse> getSongs() {
        return songService.findAll();
    }

    @GetMapping("/{songId}")
    public SongResponse getSong(@PathVariable Long songId) {
        return songService.findById(songId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SongResponse createSong(@Valid @RequestBody SongRequest request) {
        return songService.create(request);
    }

    @PutMapping("/{songId}")
    public SongResponse updateSong(@PathVariable Long songId, @Valid @RequestBody SongRequest request) {
        return songService.update(songId, request);
    }

    @DeleteMapping("/{songId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSong(@PathVariable Long songId) {
        songService.delete(songId);
    }
}
