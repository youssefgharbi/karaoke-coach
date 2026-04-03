export type LyricLine = {
  id: number;
  lineOrder: number;
  text: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
};

export type Song = {
  id: number;
  title: string;
  artist?: string | null;
  originalKey?: string | null;
  bpm?: number;
  audioUrl?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  coverImageUrl?: string | null;
  spotifyTrackId?: string | null;
  youtubeKaraokeUrl?: string | null;
};

export type SongPayload = {
  title: string;
  artist?: string;
  originalKey?: string;
  bpm?: number;
  audioUrl?: string;
  mediaUrl?: string;
  mediaType?: string;
  coverImageUrl?: string;
  spotifyTrackId?: string;
  youtubeKaraokeUrl?: string;
};
