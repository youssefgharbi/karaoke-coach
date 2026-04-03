package com.youssef.karaokecoach.pitchguide.domain;

import com.youssef.karaokecoach.song.domain.Song;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class PitchGuideNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id")
    private Song song;

    private Integer noteOrder;
    private String lyricChunk;
    private Double startTimeSeconds;
    private Double endTimeSeconds;
    private Integer midiNote;
    private String noteLabel;

    public Long getId() {
        return id;
    }

    public Song getSong() {
        return song;
    }

    public void setSong(Song song) {
        this.song = song;
    }

    public Integer getNoteOrder() {
        return noteOrder;
    }

    public void setNoteOrder(Integer noteOrder) {
        this.noteOrder = noteOrder;
    }

    public String getLyricChunk() {
        return lyricChunk;
    }

    public void setLyricChunk(String lyricChunk) {
        this.lyricChunk = lyricChunk;
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

    public Integer getMidiNote() {
        return midiNote;
    }

    public void setMidiNote(Integer midiNote) {
        this.midiNote = midiNote;
    }

    public String getNoteLabel() {
        return noteLabel;
    }

    public void setNoteLabel(String noteLabel) {
        this.noteLabel = noteLabel;
    }
}
