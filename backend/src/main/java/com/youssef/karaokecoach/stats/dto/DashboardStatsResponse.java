package com.youssef.karaokecoach.stats.dto;

public record DashboardStatsResponse(
        int songCount,
        int sessionCount,
        double averagePitchScore
) {
}
