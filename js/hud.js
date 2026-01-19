export class Hud {
  constructor({ baseLifeEl, scoreEl, paceEl, timeLeftEl, phaseEl, bestScoreEl, overlay, overlayTitle, overlaySubtitle }) {
    this.baseLifeEl = baseLifeEl;
    this.scoreEl = scoreEl;
    this.paceEl = paceEl;
    this.timeLeftEl = timeLeftEl;
    this.phaseEl = phaseEl;
    this.bestScoreEl = bestScoreEl;
    this.overlay = overlay;
    this.overlayTitle = overlayTitle;
    this.overlaySubtitle = overlaySubtitle;
  }

  update({ baseLife, score, timeLeft, scenario }, pace, best, formattedTime) {
    this.baseLifeEl.textContent = baseLife;
    this.scoreEl.textContent = score;
    this.paceEl.textContent = `${pace} inim/seg`;
    this.timeLeftEl.textContent = formattedTime;
    if (this.phaseEl) this.phaseEl.textContent = scenario;
    this.bestScoreEl.textContent = best;
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
