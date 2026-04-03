package com.youssef.karaokecoach.practice.controller;

import com.youssef.karaokecoach.practice.dto.CompleteSessionRequest;
import com.youssef.karaokecoach.practice.dto.PracticeSessionResponse;
import com.youssef.karaokecoach.practice.dto.StartSessionRequest;
import com.youssef.karaokecoach.practice.service.PracticeSessionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class PracticeSessionController {

    private final PracticeSessionService practiceSessionService;

    public PracticeSessionController(PracticeSessionService practiceSessionService) {
        this.practiceSessionService = practiceSessionService;
    }

    @GetMapping
    public List<PracticeSessionResponse> getSessions() {
        return practiceSessionService.findAll();
    }

    @PostMapping
    public PracticeSessionResponse startSession(@Valid @RequestBody StartSessionRequest request) {
        return practiceSessionService.start(request);
    }

    @PostMapping("/{sessionId}/complete")
    public PracticeSessionResponse completeSession(@PathVariable Long sessionId,
                                                   @Valid @RequestBody CompleteSessionRequest request) {
        return practiceSessionService.complete(sessionId, request);
    }
}
