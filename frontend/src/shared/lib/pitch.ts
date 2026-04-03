const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function midiToFrequency(midiNote: number) {
  return 440 * 2 ** ((midiNote - 69) / 12);
}

export function frequencyToMidiFloat(frequency: number) {
  return 69 + 12 * Math.log2(frequency / 440);
}

export function midiToLabel(midiNote: number) {
  const normalized = Math.round(midiNote);
  const noteIndex = ((normalized % 12) + 12) % 12;
  const octave = Math.floor(normalized / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

export function centsFromTargetFrequency(frequency: number, targetFrequency: number) {
  return Math.round(1200 * Math.log2(frequency / targetFrequency));
}
