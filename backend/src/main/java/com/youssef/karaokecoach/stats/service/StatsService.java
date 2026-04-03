package com.youssef.karaokecoach.stats.service;

import com.youssef.karaokecoach.practice.domain.PracticeSession;
import com.youssef.karaokecoach.practice.repository.PracticeSessionRepository;
import com.youssef.karaokecoach.song.repository.SongRepository;
import com.youssef.karaokecoach.stats.dto.DashboardStatsResponse;
import org.springframework.stereotype.Service;

@Service
public class StatsService {

    private final SongRepository songRepository;
    private final PracticeSessionRepository practiceSessionRepository;

    public StatsService(SongRepository songRepository, PracticeSessionRepository practiceSessionRepository) {
        this.songRepository = songRepository;
        this.practiceSessionRepository = practiceSessionRepository;
    }

    public DashboardStatsResponse getDashboardStats() {
        int songCount = Math.toIntExact(songRepository.count());
        var sessions = practiceSessionRepository.findAll();
        int sessionCount = sessions.size();
        double averagePitchScore = sessions.stream()
                .map(PracticeSession::getAveragePitchScore)
                .filter(score -> score != null)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0);

        return new DashboardStatsResponse(songCount, sessionCount, averagePitchScore);
    }
}
