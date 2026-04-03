export type PitchGuideNote = {
  id: number;
  noteOrder: number;
  lyricChunk: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  midiNote: number;
  noteLabel: string;
};
