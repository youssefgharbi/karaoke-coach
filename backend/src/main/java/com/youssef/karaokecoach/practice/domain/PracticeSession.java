package com.youssef.karaokecoach.practice.domain;

import com.youssef.karaokecoach.song.domain.Song;
import com.youssef.karaokecoach.user.domain.User;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class PracticeSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id")
    private Song song;

    private Integer transposeSemitones;
    private Double averagePitchScore;
    private Integer flatMoments;
    private Integer sharpMoments;
    private String notes;

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Song getSong() {
        return song;
    }

    public void setSong(Song song) {
        this.song = song;
    }

    public Integer getTransposeSemitones() {
        return transposeSemitones;
    }

    public void setTransposeSemitones(Integer transposeSemitones) {
        this.transposeSemitones = transposeSemitones;
    }

    public Double getAveragePitchScore() {
        return averagePitchScore;
    }

    public void setAveragePitchScore(Double averagePitchScore) {
        this.averagePitchScore = averagePitchScore;
    }

    public Integer getFlatMoments() {
        return flatMoments;
    }

    public void setFlatMoments(Integer flatMoments) {
        this.flatMoments = flatMoments;
    }

    public Integer getSharpMoments() {
        return sharpMoments;
    }

    public void setSharpMoments(Integer sharpMoments) {
        this.sharpMoments = sharpMoments;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
