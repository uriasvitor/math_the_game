export class Hud {
  constructor({ baseLifeEl, scoreEl, paceEl, timeLeftEl, phaseEl, bestScoreEl, overlay, overlayTitle, overlaySubtitle, healthEl, waveEl, bossBarEl, bossBarFill }) {
    this.baseLifeEl = baseLifeEl;
    this.scoreEl = scoreEl;
    this.paceEl = paceEl;
    this.timeLeftEl = timeLeftEl;
    this.phaseEl = phaseEl;
    this.bestScoreEl = bestScoreEl;
    this.overlay = overlay;
    this.overlayTitle = overlayTitle;
    this.overlaySubtitle = overlaySubtitle;
    this.healthEl = healthEl;
    this.waveEl = waveEl;
    this.bossBarEl = bossBarEl;
    this.bossBarFill = bossBarFill;
  }

  update({ baseLife, score, timeLeft, scenario, healthLabel, healthClass, wave, bossActive, bossHpPct }, pace, best, formattedTime) {
    this.baseLifeEl.textContent = baseLife;
    this.scoreEl.textContent = score;
    this.paceEl.textContent = `${pace} inim/seg`;
    this.timeLeftEl.textContent = formattedTime;
    if (this.phaseEl) this.phaseEl.textContent = scenario;
    this.bestScoreEl.textContent = best;
    if (this.healthEl) {
      this.healthEl.textContent = healthLabel;
      this.healthEl.className = healthClass;
    }
    if (this.waveEl) {
      this.waveEl.textContent = wave;
    }
    if (this.bossBarEl && this.bossBarFill) {
      if (bossActive) {
        this.bossBarEl.classList.remove('hidden');
        this.bossBarFill.style.width = `${bossHpPct}%`;
      } else {
        this.bossBarEl.classList.add('hidden');
      }
    }
  }

  setPhaseLabel(label) {
    if (this.phaseEl) this.phaseEl.textContent = label;
  }

  showOverlay(title, subtitle) {
    this.overlayTitle.textContent = title;
    this.overlaySubtitle.textContent = subtitle;
    this.overlay.classList.remove('hidden');
  }

  hideOverlay() {
    this.overlay.classList.add('hidden');
  }

  flashInput(el) {
    el.classList.remove('shake');
    // force reflow
    void el.offsetWidth;
    el.classList.add('shake');
  }
}
