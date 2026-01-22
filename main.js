import { AudioManager } from "./js/audio.js";
import { StorageManager } from "./js/storage.js";
import { Renderer } from "./js/renderer.js";
import { Hud } from "./js/hud.js";
import { Game } from "./js/game.js";
import { STORAGE_KEY } from "./js/config.js";

const canvas = document.getElementById("arena");
const answerInput = document.getElementById("answer");
const shootBtn = document.getElementById("shootBtn");
const startBtn = document.getElementById("startBtn");
const modsBtn = document.getElementById("modsBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const playAgainBtn = document.getElementById("playAgain");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlaySubtitle = document.getElementById("overlaySubtitle");
const startScreen = document.getElementById("startScreen");
const heroStart = document.getElementById("heroStart");
const modeScreen = document.getElementById("modeScreen");
const modeCards = document.querySelectorAll(".mode-card");
const trainDigitsInput = document.getElementById("trainDigits");
const trainOperationSelect = document.getElementById("trainOperation");
const trainStartBtn = document.getElementById("trainStartBtn");
const trainConfigPanel = document.getElementById("trainConfigPanel");
const trainBackBtn = document.getElementById("trainBackBtn");
const sandboxPanel = document.getElementById("sandboxPanel");
const sbEntity = document.getElementById("sbEntity");
const sbCount = document.getElementById("sbCount");
const sbDigits = document.getElementById("sbDigits");
const sbOperation = document.getElementById("sbOperation");
const sbSpawnBtn = document.getElementById("sbSpawnBtn");
const sbBackBtn = document.getElementById("sbBackBtn");
const sbStartBtn = document.getElementById("sbStartBtn");
const closeMode = document.getElementById("closeMode");
const resetAllBtn = document.getElementById("resetAllBtn");
const bossBarEl = document.getElementById("bossBar");
const bossBarFill = document.getElementById("bossBarFill");

const baseLifeEl = document.getElementById("baseLife");
const scoreEl = document.getElementById("score");
const phaseEl = document.getElementById("phase");
const paceEl = document.getElementById("pace");
const timeLeftEl = document.getElementById("timeLeft");
const bestScoreEl = document.getElementById("bestScore");

const audio = new AudioManager();
const storage = new StorageManager(STORAGE_KEY);
const renderer = new Renderer(canvas);
const waveEl = document.getElementById("wave");
const healthEl = document.getElementById("healthStatus");

const hud = new Hud({
  baseLifeEl,
  scoreEl,
  paceEl,
  timeLeftEl,
  phaseEl,
  bestScoreEl,
  overlay,
  overlayTitle,
  overlaySubtitle,
  healthEl,
  waveEl,
  bossBarEl,
  bossBarFill,
});
const game = new Game({ renderer, hud, audio, storage, answerInput });

// attempt counter for current session
const attemptsCounterEl = document.getElementById("attemptsCounter");
let sessionAttempts = 0;

function updateAttemptsDisplay() {
  if (!attemptsCounterEl) return;
  attemptsCounterEl.textContent = `Tentativas: ${sessionAttempts}`;
}

// load mods from localStorage
const modAutoResetEl = document.getElementById("modAutoReset");
const modOneStrikeEl = document.getElementById("modOneStrike");
const modsCloseBtn = document.getElementById("modsCloseBtn");
function loadMods() {
  try {
    const raw = localStorage.getItem("md_mods");
    if (!raw) return { autoReset: false, oneStrike: false };
    return JSON.parse(raw);
  } catch (e) {
    return { autoReset: false, oneStrike: false };
  }
}
function saveMods(mods) {
  try {
    localStorage.setItem("md_mods", JSON.stringify(mods));
  } catch (e) {}
}
const initialMods = loadMods();
if (modAutoResetEl) modAutoResetEl.checked = !!initialMods.autoReset;
if (modOneStrikeEl) modOneStrikeEl.checked = !!initialMods.oneStrike;
game.setMods && game.setMods(initialMods);

function openModeSelection() {
  startScreen.classList.add("hidden");
  modeScreen.classList.remove("hidden");
}

function closeModeSelection() {
  modeScreen.classList.add("hidden");
}

function getTrainingDigits() {
  if (!trainDigitsInput) return undefined;
  const raw = Number.parseInt(trainDigitsInput.value, 10);
  const min = Number.parseInt(trainDigitsInput.min, 10) || 1;
  const max = Number.parseInt(trainDigitsInput.max, 10) || 9;
  const value = Number.isFinite(raw) ? raw : min;
  const clamped = Math.max(min, Math.min(max, value));
  trainDigitsInput.value = String(clamped);
  return clamped;
}

function getTrainingOperation() {
  if (!trainOperationSelect) return "add";
  const v = String(trainOperationSelect.value || "add");
  const allowed = new Set(["add", "sub", "mul", "div", "sqrt"]);
  return allowed.has(v) ? v : "add";
}

function pickScenario(mode) {
  audio.ensure();
  if (mode === "train") {
    const digits = getTrainingDigits();
    const operation = getTrainingOperation();
    game.setScenario(mode, { digits, operation });
  } else {
    game.setScenario(mode);
  }
  game.reset();
  // increment attempts when a run is actually started
  sessionAttempts++;
  updateAttemptsDisplay();
  game.start();
  closeModeSelection();
  startScreen.classList.add("hidden");
  answerInput.focus();
}

shootBtn.addEventListener("click", () => game.handleShot(answerInput.value));
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    if (!overlay.classList.contains("hidden")) {
      game.reset();
      game.start();
      event.preventDefault();
      return;
    }
    game.handleShot(answerInput.value);
  }
});

startBtn.addEventListener("click", openModeSelection);
if (heroStart) heroStart.addEventListener("click", openModeSelection);
closeMode.addEventListener("click", closeModeSelection);
modeCards.forEach((card) => {
  card.addEventListener("click", () => {
    const mode = card.dataset.scenario;
    if (mode === "train") {
      // show dedicated train config panel
      if (trainConfigPanel) trainConfigPanel.classList.remove("hidden");
      const grid = modeScreen.querySelector(".mode-grid");
      if (grid) grid.classList.add("hidden");
      if (closeMode) closeMode.classList.add("hidden");
      modeScreen.classList.remove("hidden");
      trainDigitsInput?.focus();
      return;
    } else if (mode === "sandbox") {
      if (sandboxPanel) sandboxPanel.classList.remove("hidden");
      const grid = modeScreen.querySelector(".mode-grid");
      if (grid) grid.classList.add("hidden");
      if (closeMode) closeMode.classList.add("hidden");
      modeScreen.classList.remove("hidden");
      sbEntity?.focus();
      return;
    }
    pickScenario(mode);
  });
});

if (trainStartBtn) {
  trainStartBtn.addEventListener("click", () => pickScenario("train"));
}

if (trainBackBtn) {
  trainBackBtn.addEventListener("click", () => {
    if (trainConfigPanel) trainConfigPanel.classList.add("hidden");
    const grid = modeScreen.querySelector(".mode-grid");
    if (grid) grid.classList.remove("hidden");
    if (closeMode) closeMode.classList.remove("hidden");
  });
}
if (sbBackBtn) {
  sbBackBtn.addEventListener("click", () => {
    if (sandboxPanel) sandboxPanel.classList.add("hidden");
    const grid = modeScreen.querySelector(".mode-grid");
    if (grid) grid.classList.remove("hidden");
    if (closeMode) closeMode.classList.remove("hidden");
  });
}

// mods close handler
if (modsCloseBtn) {
  modsCloseBtn.addEventListener("click", () => {
    const modsPanel = document.getElementById("modsPanel");
    if (modsPanel) modsPanel.classList.add("hidden");
    const grid = modeScreen.querySelector(".mode-grid");
    if (grid) grid.classList.remove("hidden");
    if (closeMode) closeMode.classList.remove("hidden");
  });
}

// wire mod toggles
if (modAutoResetEl) {
  modAutoResetEl.addEventListener("change", () => {
    const mods = {
      autoReset: !!modAutoResetEl.checked,
      oneStrike: !!modOneStrikeEl.checked,
    };
    saveMods(mods);
    game.setMods && game.setMods(mods);
  });
}
if (modOneStrikeEl) {
  modOneStrikeEl.addEventListener("change", () => {
    const mods = {
      autoReset: !!modAutoResetEl.checked,
      oneStrike: !!modOneStrikeEl.checked,
    };
    saveMods(mods);
    game.setMods && game.setMods(mods);
  });
}

if (sbSpawnBtn) {
  sbSpawnBtn.addEventListener("click", () => {
    const kind = sbEntity.value || "asteroid";
    const count = Math.max(1, Number.parseInt(sbCount.value, 10) || 1);
    const digits = Math.max(1, Number.parseInt(sbDigits.value, 10) || 1);
    const operation = sbOperation.value || "add";
    for (let i = 0; i < count; i++) {
      game.spawnCustom(kind, { digits, operation });
    }
    audio.playSpawn();
  });
}

// open Mods panel from mode screen via keyboard shortcut 'M' or add a small click target
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "m") {
    const grid = modeScreen.querySelector(".mode-grid");
    if (grid) grid.classList.add("hidden");
    const modsPanel = document.getElementById("modsPanel");
    if (modsPanel) modsPanel.classList.remove("hidden");
    if (closeMode) closeMode.classList.add("hidden");
  }
});

if (modsBtn) {
  modsBtn.addEventListener("click", () => {
    // show mode screen and open mods panel
    startScreen.classList.add("hidden");
    modeScreen.classList.remove("hidden");
    const grid = modeScreen.querySelector(".mode-grid");
    if (grid) grid.classList.add("hidden");
    const modsPanel = document.getElementById("modsPanel");
    if (modsPanel) modsPanel.classList.remove("hidden");
    if (closeMode) closeMode.classList.add("hidden");
  });
}

updateAttemptsDisplay();

if (sbStartBtn) {
  sbStartBtn.addEventListener("click", () => pickScenario("sandbox"));
}

pauseBtn.addEventListener("click", () => game.pause());

resetBtn.addEventListener("click", () => {
  game.reset();
  openModeSelection();
});

playAgainBtn.addEventListener("click", () => {
  game.reset();
  openModeSelection();
});

resetAllBtn.addEventListener("click", () => {
  storage.clearAll();
  game.reset();
  openModeSelection();
});

window.addEventListener(
  "pointerdown",
  () => {
    audio.ensure();
    audio.resume();
  },
  { once: true },
);

game.reset();

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  game.step(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
startScreen.classList.remove("hidden");
