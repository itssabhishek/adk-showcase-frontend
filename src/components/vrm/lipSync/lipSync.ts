import { LipSyncAnalyzeResult } from './lipSyncAnalyzeResult';

const TIME_DOMAIN_DATA_LENGTH = 2048;

export class LipSync {
  public readonly audio: AudioContext;
  public readonly analyser: AnalyserNode;
  public readonly timeDomainData: Float32Array;
  private audioContext: AudioContext;
  private source?: AudioBufferSourceNode;
  private dataArray: Uint8Array;
  private volume: number = 0;
  private lastVolume: number = 0; // For smoothing
  private smoothingFactor: number = 0.25; // Adjust this to control smoothing (0-1)
  private gainNode: GainNode;

  public constructor(audio: AudioContext, gainNode: GainNode) {
    this.audio = audio;
    this.audioContext = audio;
    this.gainNode = gainNode;
    this.analyser = audio.createAnalyser();
    this.analyser.fftSize = 32;
    this.timeDomainData = new Float32Array(TIME_DOMAIN_DATA_LENGTH);
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  public update(): LipSyncAnalyzeResult {
    this.analyser.getFloatTimeDomainData(this.timeDomainData);

    let currentVolume = 0.0;
    for (let i = 0; i < TIME_DOMAIN_DATA_LENGTH; i++) {
      currentVolume = Math.max(currentVolume, Math.abs(this.timeDomainData[i]));
    }

    // Apply smoothing - lerp between last and current volume
    this.volume =
      this.lastVolume +
      (currentVolume - this.lastVolume) * this.smoothingFactor;
    this.lastVolume = this.volume;

    // cook
    let cookedVolume = 1 / (1 + Math.exp(-45 * this.volume + 5));
    if (cookedVolume < 0.1) cookedVolume = 0;

    return {
      volume: cookedVolume,
    };
  }

  public async playFromArrayBuffer(buffer: ArrayBuffer, onEnded?: () => void) {
    const audioBuffer = await this.audio.decodeAudioData(buffer);

    this.source = this.audio.createBufferSource();
    this.source.buffer = audioBuffer;

    // Connect source -> gain -> analyser -> destination
    this.source.connect(this.gainNode);
    this.source.connect(this.analyser);
    this.gainNode.connect(this.audio.destination);

    this.source.start();
    if (onEnded) {
      this.source.addEventListener('ended', onEnded);
    }
  }

  public async playFromURL(url: string, onEnded?: () => void) {
    try {
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();
      await this.playFromArrayBuffer(buffer, onEnded);
    } catch (error) {
      console.error('Error playing audio from URL:', error);
      if (onEnded) onEnded();
    }
  }

  public stop() {
    if (this.source) {
      try {
        this.source.stop();
        this.source.disconnect(this.gainNode);
        this.source.disconnect(this.analyser);
      } catch (e) {
        console.warn('Error stopping audio source:', e);
      }
      this.source = undefined;
    }

    this.lastVolume = 0; // Reset smoothing
    this.volume = 0;

    this.timeDomainData.fill(0);
    this.analyser.getFloatTimeDomainData(this.timeDomainData);
  }
}
