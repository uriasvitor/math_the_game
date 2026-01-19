import { AudioManager } from './js/audio.js';
import { StorageManager } from './js/storage.js';
import { Renderer } from './js/renderer.js';
import { Hud } from './js/hud.js';
import { Game } from './js/game.js';
import { STORAGE_KEY } from './js/config.js';

const canvas = document.getElementById('arena');
const answerInput = document.getElementById('answer');
const shootBtn = document.getElementById('shootBtn');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const playAgainBtn = document.getElementById('playAgain');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlaySubtitle = document.getElementById('overlaySubtitle');
const startScreen = document.getElementById('startScreen');
const heroStart = document.getElementById('heroStart');
const modeScreen = document.getElementById('modeScreen');
const modeCards = document.querySelectorAll('.mode-card');
const closeMode = document.getElementById('closeMode');
const resetAllBtn = document.getElementById('resetAllBtn');
const bossBarEl = document.getElementById('bossBar');
const bossBarFill = document.getElementById('bossBarFill');

const baseLifeEl = document.getElementById('baseLife');
const scoreEl = document.getElementById('score');
const phaseEl = document.getElementById('phase');
const paceEl = document.getElementById('pace');
const timeLeftEl = document.getElementById('timeLeft');
const bestScoreEl = document.getElementById('bestScore');

const audio = new AudioManager();
const storage = new StorageManager(STORAGE_KEY);
const renderer = new Renderer(canvas);
const waveEl = document.getElementById('wave');
const healthEl = document.getElementById('healthStatus');

const hud = new Hud({ baseLifeEl, scoreEl, paceEl, timeLeftEl, phaseEl, bestScoreEl, overlay, overlayTitle, overlaySubtitle, healthEl, waveEl, bossBarEl, bossBarFill });
const game = new Game({ renderer, hud, audio, storage, answerInput });

function openModeSelection() {
  startScreen.classList.add('hidden');
  modeScreen.classList.remove('hidden');
}

function closeModeSelection() {
  modeScreen.classList.add('hidden');
}

function pickScenario(mode) {
  audio.ensure();
  game.setScenario(mode);
  game.reset();
  game.start();
  closeModeSelection();
  startScreen.classList.add('hidden');
  answerInput.focus();
}

shootBtn.addEventListener('click', () => game.handleShot(answerInput.value));
document.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    if (!overlay.classList.contains('hidden')) {
      game.reset();
      game.start();
      event.preventDefault();
      return;
    }
    game.handleShot(answerInput.value);
  }
});

startBtn.addEventListener('click', openModeSelection);
heroStart.addEventListener('click', openModeSelection);
closeMode.addEventListener('click', closeModeSelection);
modeCards.forEach(card => {
  card.addEventListener('click', () => pickScenario(card.dataset.scenario));
});

pauseBtn.addEventListener('click', () => game.pause());

resetBtn.addEventListener('click', () => {
  game.reset();
  openModeSelection();
});

playAgainBtn.addEventListener('click', () => {
  game.reset();
  openModeSelection();
});

resetAllBtn.addEventListener('click', () => {
  storage.clearAll();
  game.reset();
  openModeSelection();
});

window.addEventListener('pointerdown', () => {
  audio.ensure();
  audio.resume();
}, { once: true });

game.reset();

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  game.step(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
startScreen.classList.remove('hidden');
