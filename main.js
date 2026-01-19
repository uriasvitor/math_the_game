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
const scenarioSelect = document.getElementById('scenario');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlaySubtitle = document.getElementById('overlaySubtitle');

const baseLifeEl = document.getElementById('baseLife');
const scoreEl = document.getElementById('score');
const phaseEl = document.getElementById('phase');
const paceEl = document.getElementById('pace');
const timeLeftEl = document.getElementById('timeLeft');
const bestScoreEl = document.getElementById('bestScore');

const audio = new AudioManager();
const storage = new StorageManager(STORAGE_KEY);
const renderer = new Renderer(canvas);
const hud = new Hud({ baseLifeEl, scoreEl, paceEl, timeLeftEl, phaseEl, bestScoreEl, overlay, overlayTitle, overlaySubtitle });
const game = new Game({ renderer, hud, audio, storage, answerInput });

shootBtn.addEventListener('click', () => game.handleShot(answerInput.value));
document.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    game.handleShot(answerInput.value);
  }
});

startBtn.addEventListener('click', () => {
  audio.ensure();
  game.start();
});

pauseBtn.addEventListener('click', () => game.pause());

resetBtn.addEventListener('click', () => {
  game.reset();
  game.start();
});

playAgainBtn.addEventListener('click', () => {
  game.reset();
  game.start();
});

scenarioSelect.addEventListener('change', e => {
  game.setScenario(e.target.value);
  game.start();
});

window.addEventListener('pointerdown', () => {
  audio.ensure();
  audio.resume();
}, { once: true });

game.reset();
game.start();

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  game.step(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
answerInput.focus();
