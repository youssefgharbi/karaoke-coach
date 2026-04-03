export type PracticeSessionResponse = {
  id: number;
  songId: number | null;
  transposeSemitones: number | null;
  averagePitchScore: number | null;
  flatMoments: number | null;
  sharpMoments: number | null;
  notes: string | null;
};
