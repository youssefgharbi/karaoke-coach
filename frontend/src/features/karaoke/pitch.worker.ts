// pitch.worker.ts
function autoCorrelate(buffer: Float32Array, sampleRate: number) {
  let rms = 0;
  for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.0045) return null;
  const correlations = new Float32Array(buffer.length);
  for (let offset = 0; offset < buffer.length; offset++) {
    let correlation = 0;
    for (let i = 0; i < buffer.length - offset; i++) {
      correlation += buffer[i] * buffer[i + offset];
    }
    correlations[offset] = correlation;
  }
  let firstDip = 0;
  while (firstDip < correlations.length - 2 && correlations[firstDip] > correlations[firstDip + 1]) firstDip++;
  let bestOffset = -1;
  let bestCorrelation = -1;
  for (let offset = firstDip; offset < correlations.length; offset++) {
    if (correlations[offset] > bestCorrelation) {
      bestCorrelation = correlations[offset];
      bestOffset = offset;
    }
  }
  if (bestOffset <= 0 || bestOffset >= correlations.length - 1) return null;
  const left = correlations[bestOffset - 1];
  const center = correlations[bestOffset];
  const right = correlations[bestOffset + 1];
  const shift = 0.5 * (left - right) / (left - 2 * center + right);
  return sampleRate / (bestOffset + shift);
}

self.onmessage = (e: MessageEvent) => {
  const { buffer, sampleRate } = e.data;
  const frequency = autoCorrelate(buffer, sampleRate);
  self.postMessage(frequency);
};