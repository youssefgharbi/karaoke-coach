package com.youssef.karaokecoach.lyric.domain;

import com.youssef.karaokecoach.song.domain.Song;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class LyricLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id")
    private Song song;

    private Integer lineOrder;
    private String text;
    private Double startTimeSeconds;
    private Double endTimeSeconds;

    public Long getId() {
        return id;
    }

    public Song getSong() {
        return song;
    }

    public void setSong(Song song) {
        this.song = song;
    }

    public Integer getLineOrder() {
        return lineOrder;
    }

    public void setLineOrder(Integer lineOrder) {
        this.lineOrder = lineOrder;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Double getStartTimeSeconds() {
        return startTimeSeconds;
    }

    public void setStartTimeSeconds(Double startTimeSeconds) {
        this.startTimeSeconds = startTimeSeconds;
    }

    public Double getEndTimeSeconds() {
        return endTimeSeconds;
    }

    public void setEndTimeSeconds(Double endTimeSeconds) {
        this.endTimeSeconds = endTimeSeconds;
    }
}
