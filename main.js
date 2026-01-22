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

// Progression: only unlocked modes are playable
const MODE_ORDER = [
  "add",
  "sub",
  "mul",
  "div",
  "sqrt",
  "pow",
  "percent",
  "decimal",
];
function loadUnlockedModes() {
  try {
    const raw = localStorage.getItem("md_unlockedModes");
    if (!raw) return ["add"];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return ["add"];
    return arr.filter((m) => MODE_ORDER.includes(m));
  } catch (e) {
    return ["add"];
  }
}
function saveUnlockedModes(arr) {
  try {
    localStorage.setItem("md_unlockedModes", JSON.stringify(arr));
  } catch (e) {}
}
let unlockedModes = loadUnlockedModes();

function updateModeLocks() {
  modeCards.forEach((card) => {
    const mode = card.dataset.scenario;
    if (!MODE_ORDER.includes(mode)) return;
    if (unlockedModes.includes(mode)) {
      card.classList.remove("locked-mode");
      card.disabled = false;
    } else {
      card.classList.add("locked-mode");
      card.disabled = true;
    }
  });
}
updateModeLocks();
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
const confirmResetModal = document.getElementById("confirmResetModal");
const confirmResetBtn = document.getElementById("confirmResetBtn");
const cancelResetBtn = document.getElementById("cancelResetBtn");
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
const game = new Game({
  renderer,
  hud,
  audio,
  storage,
  answerInput,
  onRunStart: () => {
    sessionAttempts++;
    updateAttemptsDisplay();
  },
});

// attempt counter for current session
const attemptsCounterEl = document.getElementById("attemptsCounter");
let sessionAttempts = 0;

function updateAttemptsDisplay() {
  if (!attemptsCounterEl) return;
  attemptsCounterEl.textContent = `Tentativas: ${sessionAttempts}`;
}

// load mods from localStorage
const modAutoResetEl = document.getElementById("modAutoReset");
const modAutoResetOnLossEl = document.getElementById("modAutoResetOnLoss");
const modOneStrikeEl = document.getElementById("modOneStrike");
const modsCloseBtn = document.getElementById("modsCloseBtn");
function loadMods() {
  try {
    const raw = localStorage.getItem("md_mods");
    if (!raw)
      return { autoReset: false, autoResetOnLoss: false, oneStrike: false };
    return JSON.parse(raw);
  } catch (e) {
    return { autoReset: false, autoResetOnLoss: false, oneStrike: false };
  }
}
function saveMods(mods) {
  try {
    localStorage.setItem("md_mods", JSON.stringify(mods));
  } catch (e) {}
}
const initialMods = loadMods();
if (modAutoResetEl) modAutoResetEl.checked = !!initialMods.autoReset;
if (modAutoResetOnLossEl)
  modAutoResetOnLossEl.checked = !!initialMods.autoResetOnLoss;
if (modOneStrikeEl) modOneStrikeEl.checked = !!initialMods.oneStrike;
game.setMods && game.setMods(initialMods);

function openModeSelection() {
  startScreen.classList.add("hidden");
  modeScreen.classList.remove("hidden");
}

function closeModeSelection() {
  modeScreen.classList.add("hidden");
  // remove scenario-only filter when closing
  if (modeScreen) modeScreen.classList.remove("scenario-only");
  // ensure we return to the start screen (do not reveal a paused game)
  if (startScreen) startScreen.classList.remove("hidden");
  // hide any sub-panels that may be open
  if (trainConfigPanel) trainConfigPanel.classList.add("hidden");
  if (sandboxPanel) sandboxPanel.classList.add("hidden");
  // reset the game so the arena is not left paused in the background
  try {
    game.reset();
  } catch (e) {}
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
  // allow new operations: potenciação (pow), porcentagem (percent), decimais
  allowed.add("pow");
  allowed.add("percent");
  allowed.add("decimal");
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
  game.start();
  // hide the mode screen without triggering the 'back to start' reset
  if (modeScreen) modeScreen.classList.add("hidden");
  startScreen.classList.add("hidden");
  answerInput.focus();
}

shootBtn.addEventListener("click", () => game.handleShot(answerInput.value));
document.addEventListener("keydown", (event) => {
  const k = event.key;
  // Enter: either submit shot or, when overlay is visible, reset+start
  if (k === "Enter") {
    if (!overlay.classList.contains("hidden")) {
      game.reset();
      game.start();
      event.preventDefault();
      return;
    }
    game.handleShot(answerInput.value);
    return;
  }

  // 'f' (case-insensitive) opens the mode selection screen
  if (k.toLowerCase && k.toLowerCase() === "f") {
    openModeSelection();
    event.preventDefault();
    return;
  }

  // Single-quote (') — always reset and immediately start the game
  if (k === "'") {
    try {
      game.reset();
      game.start();
      event.preventDefault();
    } catch (err) {}
    return;
  }
});

startBtn.addEventListener("click", openModeSelection);
if (heroStart) heroStart.addEventListener("click", openModeSelection);
closeMode.addEventListener("click", closeModeSelection);
modeCards.forEach((card) => {
  card.addEventListener("click", () => {
    const mode = card.dataset.scenario;
    if (card.classList.contains("locked-mode")) return;
    if (mode === "train") {
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
      autoResetOnLoss: !!modAutoResetOnLossEl?.checked,
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
      autoResetOnLoss: !!modAutoResetOnLossEl?.checked,
      oneStrike: !!modOneStrikeEl.checked,
    };
    saveMods(mods);
    game.setMods && game.setMods(mods);
  });
}
if (modAutoResetOnLossEl) {
  modAutoResetOnLossEl.addEventListener("change", () => {
    const mods = {
      autoReset: !!modAutoResetEl.checked,
      autoResetOnLoss: !!modAutoResetOnLossEl.checked,
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

// Main menu buttons
const menuStart = document.getElementById("menuStart");
const menuScenario = document.getElementById("menuScenario");
const menuSettings = document.getElementById("menuSettings");
const menuScore = document.getElementById("menuScore");
const scorePanel = document.getElementById("scorePanel");
const scoreCloseBtn = document.getElementById("scoreCloseBtn");

if (menuStart)
  menuStart.addEventListener("click", () => {
    // open full mode selection (no scenario-only filter)
    startScreen.classList.add("hidden");
    modeScreen.classList.remove("hidden");
    modeScreen.classList.remove("scenario-only");
    const grid = modeScreen.querySelector(".mode-grid");
    if (grid) grid.classList.remove("hidden");
    if (closeMode) closeMode.classList.remove("hidden");
    // update locks every time menu is opened
    unlockedModes = loadUnlockedModes();
    updateModeLocks();
  });
if (menuScenario)
  menuScenario.addEventListener("click", () => {
    // show only train and sandbox options
    startScreen.classList.add("hidden");
    modeScreen.classList.remove("hidden");
    modeScreen.classList.add("scenario-only");
    const grid = modeScreen.querySelector(".mode-grid");
    if (grid) grid.classList.remove("hidden");
    if (closeMode) closeMode.classList.remove("hidden");
  });
if (menuSettings)
  menuSettings.addEventListener("click", () => {
    // open mods/settings panel
    startScreen.classList.add("hidden");
    modeScreen.classList.remove("hidden");
    const grid = modeScreen.querySelector(".mode-grid");
    if (grid) grid.classList.add("hidden");
    const modsPanel = document.getElementById("modsPanel");
    if (modsPanel) modsPanel.classList.remove("hidden");
    if (closeMode) closeMode.classList.add("hidden");
  });
if (menuScore)
  menuScore.addEventListener("click", () => {
    try {
      if (scorePanel) scorePanel.classList.remove("hidden");
      // populate best scores
      const bAdd = document.getElementById("best_add");
      const bSub = document.getElementById("best_sub");
      const bMul = document.getElementById("best_mul");
      const bDiv = document.getElementById("best_div");
      if (bAdd) bAdd.textContent = String(storage.getBest("add") || 0);
      if (bSub) bSub.textContent = String(storage.getBest("sub") || 0);
      if (bMul) bMul.textContent = String(storage.getBest("mul") || 0);
      if (bDiv) bDiv.textContent = String(storage.getBest("div") || 0);
    } catch (e) {}
  });
if (scoreCloseBtn)
  scoreCloseBtn.addEventListener("click", () => {
    if (scorePanel) scorePanel.classList.add("hidden");
  });

pauseBtn.addEventListener("click", () => game.pause());

resetBtn.addEventListener("click", () => {
  game.reset();
  // reset session attempts and update display
  sessionAttempts = 0;
  updateAttemptsDisplay();
  openModeSelection();
});

playAgainBtn.addEventListener("click", () => {
  game.reset();
  // also reset attempts when explicitly choosing to play again
  sessionAttempts = 0;
  updateAttemptsDisplay();
  openModeSelection();
});

if (resetAllBtn) {
  resetAllBtn.addEventListener("click", () => {
    if (confirmResetModal) confirmResetModal.classList.remove("hidden");
  });
}

if (cancelResetBtn) {
  cancelResetBtn.addEventListener("click", () => {
    if (confirmResetModal) confirmResetModal.classList.add("hidden");
  });
}

if (confirmResetBtn) {
  confirmResetBtn.addEventListener("click", () => {
    try {
      storage.clearAll();
      localStorage.removeItem("md_mods");
    } catch (e) {}
    sessionAttempts = 0;
    updateAttemptsDisplay();
    try {
      if (confirmResetModal) confirmResetModal.classList.add("hidden");
    } catch (e) {}
    game.reset();
    openModeSelection();
  });
}

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
