class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096; // Increased buffer size for better streaming
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    this.sampleRate = 16000;
    this.gainValue = 5.0; // Reduced gain to prevent clipping
    this.noiseFloor = 0.005;
    this.prevSample = 0; // For DC offset removal
  }
  
  process(inputs) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const inputChannel = input[0];
      
      // Process input samples
      for (let i = 0; i < inputChannel.length; i++) {
        if (this.bufferIndex < this.bufferSize) {
          // DC offset removal (high-pass filter)
          const sample = inputChannel[i] - this.prevSample + 0.995 * this.prevSample;
          this.prevSample = sample;
          
          // Apply gain and noise gate
          let processedSample = sample * this.gainValue;
          processedSample = Math.abs(processedSample) > this.noiseFloor ? processedSample : 0;
          
          // Soft clipping
          if (processedSample > 1.0) {
            processedSample = Math.tanh(processedSample);
          } else if (processedSample < -1.0) {
            processedSample = -Math.tanh(-processedSample);
          }
          
          this.buffer[this.bufferIndex++] = processedSample;
        }
      }

      // Process and send when buffer is full
      if (this.bufferIndex >= this.bufferSize) {
        // Calculate RMS
        const rms = Math.sqrt(
          this.buffer.reduce((acc, val) => acc + val * val, 0) / this.bufferSize
        );

        if (rms > this.noiseFloor) {
          // Convert to 16-bit PCM with proper byte ordering
          const pcmData = new Int16Array(this.bufferSize);
          
          for (let i = 0; i < this.bufferSize; i++) {
            // Scale to 16-bit range with headroom
            const sample = this.buffer[i] * 0.8; // Leave 20% headroom
            pcmData[i] = Math.floor(sample * 32767);
          }

          this.port.postMessage({
            audioData: pcmData,
            rms: rms,
            stats: {
              peak: Math.max(...pcmData.map(Math.abs)),
              avg: pcmData.reduce((a, b) => a + Math.abs(b), 0) / pcmData.length,
              activeFrames: pcmData.filter(v => Math.abs(v) > 0).length
            }
          });
        }

        // Reset buffer
        this.bufferIndex = 0;
        this.buffer.fill(0);
      }
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);