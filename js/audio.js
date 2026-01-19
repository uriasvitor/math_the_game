export class AudioManager {
  constructor() {
    this.ctx = null;
  }

  ensure() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, duration, type = 'sine', volume = 0.2) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain).connect(this.ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.stop(this.ctx.currentTime + duration);
  }

  playShoot() {
    this.playTone(520, 0.1, 'square', 0.25);
  }

  playHit() {
    this.playTone(240, 0.12, 'triangle', 0.2);
    setTimeout(() => this.playTone(160, 0.08, 'triangle', 0.15), 60);
  }

  playDamage() {
    this.playTone(90, 0.3, 'sawtooth', 0.4);
  }
}
