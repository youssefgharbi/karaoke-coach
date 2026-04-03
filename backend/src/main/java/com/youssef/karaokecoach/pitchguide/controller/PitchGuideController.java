package com.youssef.karaokecoach.pitchguide.controller;

import com.youssef.karaokecoach.pitchguide.dto.PitchGuideNoteRequest;
import com.youssef.karaokecoach.pitchguide.dto.PitchGuideNoteResponse;
import com.youssef.karaokecoach.pitchguide.service.PitchGuideService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/songs/{songId}/pitch-guide")
public class PitchGuideController {

    private final PitchGuideService pitchGuideService;

    public PitchGuideController(PitchGuideService pitchGuideService) {
        this.pitchGuideService = pitchGuideService;
    }

    @GetMapping
    public List<PitchGuideNoteResponse> getPitchGuide(@PathVariable Long songId) {
        return pitchGuideService.findBySongId(songId);
    }

    @PutMapping
    public List<PitchGuideNoteResponse> updatePitchGuide(@PathVariable Long songId,
                                                         @Valid @RequestBody List<PitchGuideNoteRequest> request) {
        return pitchGuideService.replaceGuide(songId, request);
    }
}
