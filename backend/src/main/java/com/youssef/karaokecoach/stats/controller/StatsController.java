package com.youssef.karaokecoach.stats.controller;

import com.youssef.karaokecoach.stats.dto.DashboardStatsResponse;
import com.youssef.karaokecoach.stats.service.StatsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/dashboard")
    public DashboardStatsResponse getDashboardStats() {
        return statsService.getDashboardStats();
    }
}
