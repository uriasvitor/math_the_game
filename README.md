# Math Defender

Math Defender is a browser-based typing / math-practice game built with plain JavaScript and THREE.js for sprite rendering. Defend the base by typing answers to arithmetic problems before enemies reach the orbital barrier.

**Key Features**

- Multiple game modes: addition, subtraction, multiplication, division, square root.
- Training mode with configurable digits and operation.
- Sandbox mode for manual spawning of enemies (asteroids, minions, hearts, boss).
- "Recuperação" (Recovery) mode — practices the problems you miss most.
- Mods: Auto Reset (auto-restart after game end) and One-Strike (lose on first base hit).
- Local persistence for best scores and failure statistics (localStorage).
- Lightweight audio cues for spawn / hit / destroy / coin.

**Quick Start**

- Open `index.html` in a modern browser. For full functionality (ES modules + fetch) use a local server:

```bash
# Python 3 recommended
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

**Controls**

- Type the result of the problem in the input and press Enter or click "Atirar" to shoot.
- `Niveis` opens the mode selector (or click "Começar" on the start screen).
- `Mods` opens the mods panel (or press `M`).
- `Resetar tudo` opens a confirmation modal and clears all saved progress.

**Game Modes**

- `Soma` / `Subtracao` / `Multiplicacao` / `Divisao` / `Raiz`: main level gameplay — enemies spawn with problems appropriate to the mode.
- `Treino`: configure digits and operation. Training shows infinite life in the HUD and is ideal for focused practice.
- `Sandbox`: spawn entities manually for testing or practice; provides immediate labels and spawn sounds.
- `Recuperação`: focuses on the problems you miss most (only problems with repeated misses are included — the default threshold is 10 misses).

**Mods**

- Auto Reset: when enabled, the game automatically restarts a short moment after it ends.
- One-Strike: a single base hit ends the run immediately.
- Mods are saved in localStorage under the key `md_mods`.

**Persistence & Recovery Mechanics**

- Best scores are saved via `StorageManager` using the key configured in `js/config.js` (constant `STORAGE_KEY`).
- Missed problems (for Recovery mode) are recorded by `StorageManager.registerFailure(label, answer)` when an enemy reaches the barrier — but misses are NOT recorded during `train` or `sandbox` modes.
- The Recovery list exposes only problems missed at least N times (default N = 10). Successes in `recuperacao` call `registerSuccess(label)` and decrement the counter; once the counter reaches 0 the problem is removed from the list.
- To clear saved highs and failure logs: use the "Resetar tudo" button and confirm in the modal.

**Files of Interest (editing / extending)**

- `index.html`: UI and mode panels.
- `main.js`: app wiring, UI handlers, and session tracking (attempt counter).
- `js/game.js`: core game loop, spawn logic, mods handling, `spawnCustom()` API, and hooks for recovery tracking.
- `js/problems.js`: problem generation; add/remove operations or tweak difficulty here.
- `js/renderer.js`: THREE.js rendering helpers and label overlays.
- `js/audio.js`: sound generation and effects.
- `js/storage.js`: persistence logic — best scores and failure counters (useful for `recuperacao`).
- `js/config.js`: constants such as `TOTAL_TIME`, scenarios and speed/spawn tuning.
- `styles/style.css`: visual theme; panels now follow the terminal-panel style.

**Developer Notes & Customization**

- To change the recovery threshold (how many misses before a problem is included), edit `THRESHOLD` in `js/storage.js` inside `getTopFailures()`.
- To add a new operation (for example: powers or modulus), update `js/problems.js` with a handler and, if needed, add a scenario entry in `js/config.js`.
- To change sprite sizes or rendering order, modify `js/renderer.js`.
- Audio requires user gesture in the page to allow playback — clicking the canvas or buttons activates audio.

**Testing Tips**

- Use `Sandbox` to spawn specific enemies and confirm labels and audio.
- To simulate repeated misses for `Recuperação`, play a normal mode (not train/sandbox), let the same problem pass multiple times, then open `Recuperação`.

**Known Behavior**

- Training and Sandbox do not contribute to the recovery failure counters (by design).
- Recovery problems are chosen from the top N missed problems (sorted by miss count).

**Contributing**

- Fork the repo, make changes and open a PR. Keep diffs focused: separate visual changes from gameplay logic.

**License**

- This repository contains original code; apply a license of your choice or ask me to add a permissive license file (MIT/Apache) if you want.

---

If you want, I can also generate a short DEVELOPMENT.md with commands for local builds/tests, or add a small UI showing the top failures inside the mode screen. Which would you prefer next?
