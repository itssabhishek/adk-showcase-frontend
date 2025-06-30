export class LipSync {
  private audioContext: AudioContext;
  private source?: AudioBufferSourceNode;
  // ... other properties

  public stop() {
    if (this.source) {
      this.source.stop();
      this.source.disconnect();
      this.source = undefined;
    }
  }

  // ... rest of the class
}
