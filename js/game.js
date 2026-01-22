import {
  scenarios,
  TOTAL_TIME,
  formatTime,
  maxDigitsByScenario,
} from "./config.js";
import { ProblemGenerator } from "./problems.js";

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export class Game {
  constructor({ renderer, hud, audio, storage, answerInput, onRunStart }) {
    this.renderer = renderer;
    this.hud = hud;
    this.audio = audio;
    this.storage = storage;
    this.answerInput = answerInput;
    this.problemGen = new ProblemGenerator();
    this.mods = { autoReset: false, oneStrike: false };
    this.onRunStart = typeof onRunStart === "function" ? onRunStart : null;

    // training elapsed time counter (unbounded) so training pace can grow
    this._trainingElapsed = 0;

    this.state = this.createInitialState();
    this.hud.setPhaseLabel(this.getScenarioLabel());
  }

  setMods(mods = {}) {
    this.mods = {
      autoReset: !!mods.autoReset,
      oneStrike: !!mods.oneStrike,
    };
  }

  createInitialState() {
    return {
      running: false,
      gameOver: false,
      enemies: [],
      bullets: [],
      score: 0,
      baseLife: 3,
      scenario: "add",
      trainingDigits: 1,
      trainingOperation: "add",
      spawnTimer: 0,
      nextSpawn: scenarios.add.spawn,
      speedBoost: 0,
      enemyId: 1,
      timeLeft: TOTAL_TIME,
      totalTime: TOTAL_TIME,
      bossSpawned: false,
      bossActive: false,
      boss: null,
      bossMinionTimer: 0,
    };
  }

  get elapsed() {
    if (this.isTraining()) return this._trainingElapsed;
    return this.state.totalTime - this.state.timeLeft;
  }

  getWave() {
    return Math.max(1, 1 + Math.floor(this.elapsed / 30));
  }

  getHealthStatus() {
    if (this.isTraining()) return { label: "INF", cls: "ok" };
    if (this.state.baseLife >= 3) return { label: "OK", cls: "ok" };
    if (this.state.baseLife === 2) return { label: "WARN", cls: "warn" };
    return { label: "CRIT", cls: "crit" };
  }

  getPace() {
    const progress = Math.min(1, this.elapsed / TOTAL_TIME);
    return 0.2 + progress * 1.6;
  }

  isTraining() {
    return this.state.scenario === "train";
  }

  normalizeTrainingDigits(digits) {
    const fallback = this.state.trainingDigits || 1;
    const value = Number.isFinite(digits) ? Math.floor(digits) : fallback;
    const cap = maxDigitsByScenario.train;
    const clamped = Number.isFinite(cap) ? Math.min(value, cap) : value;
    return Math.max(1, clamped);
  }

  getProblemOptions() {
    if (!this.isTraining()) return undefined;
    return {
      digits: this.state.trainingDigits,
      operation: this.state.trainingOperation,
    };
  }

  getScenarioLabel() {
    const scenarioName = scenarios[this.state.scenario].name;
    if (this.state.scenario === "train") {
      const digits = this.state.trainingDigits;
      const unit = digits === 1 ? "digito" : "digitos";
      const opName = scenarios[this.state.trainingOperation]
        ? scenarios[this.state.trainingOperation].name
        : this.state.trainingOperation;
      return `${scenarioName} - ${digits} ${unit} (${opName})`;
    }
    if (this.state.scenario !== "add") return scenarioName;
    const stage = this.problemGen.currentStageIndex(this.elapsed) + 1;
    return `${scenarioName} - Treino ${stage}`;
  }

  getRandomElapsedForHeart() {
    const currentStage = this.problemGen.currentStageIndex(this.elapsed);
    const stage = randInt(currentStage, 2);
    if (stage === 0) return 0;
    if (stage === 1) return 60;
    return 120;
  }

  gainLife() {
    this.state.baseLife = Math.min(5, this.state.baseLife + 1);
    this.audio.playHit();
    this.updateHud();
  }

  collidesWithPlayer(enemy) {
    const player = this.renderer.player;
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const playerRadius = 40;
    const enemyRadius = enemy.kind === "asteroid" ? 36 : 28;
    const radius = playerRadius + enemyRadius;
    return dx * dx + dy * dy <= radius * radius;
  }

  spawnBoss() {
    this.state.bossSpawned = true;
    this.state.bossActive = true;
    const hp = 300;
    this.state.boss = {
      id: "boss",
      x: this.renderer.width / 2,
      y: -120,
      targetY: 120,
      hp,
      maxHp: hp,
      wobble: 0,
      problem: this.problemGen.next(
        this.state.scenario,
        this.elapsed,
        this.getProblemOptions(),
      ),
    };
    this.state.bossMinionTimer = 2.5;
    // play spawn sound and show visual cue
    try {
      this.audio.playSpawn();
      if (this.renderer)
        this.renderer.showImpactLabel(
          "CHEFÃO",
          this.state.boss.x,
          this.state.boss.y,
        );
    } catch (e) {}
  }

  hitBoss() {
    if (!this.state.bossActive || !this.state.boss) return;
    const damage = 30;
    this.state.boss.hp = Math.max(0, this.state.boss.hp - damage);
    this.state.score += 25;
    this.audio.playHit();
    if (this.state.boss.hp <= 0) {
      this.state.bossActive = false;
      this.finish("boss");
    } else {
      this.state.boss.problem = this.problemGen.next(
        this.state.scenario,
        this.elapsed,
        this.getProblemOptions(),
      );
    }
  }

  resetRunState() {
    this.state = {
      ...this.state,
      running: false,
      gameOver: false,
      enemies: [],
      bullets: [],
      score: 0,
      baseLife: 3,
      spawnTimer: 0,
      speedBoost: 0,
      enemyId: 1,
      nextSpawn: scenarios[this.state.scenario].spawn,
      timeLeft: TOTAL_TIME,
      totalTime: TOTAL_TIME,
      bossSpawned: false,
      bossActive: false,
      boss: null,
      bossMinionTimer: 0,
    };
    this._trainingElapsed = 0;
    this.state.nextSpawn = 1 / this.getPace();
    this.hud.hideOverlay();
    this.hud.setPhaseLabel(this.getScenarioLabel());
    this.answerInput.value = "";
    this.updateHud();
  }

  start() {
    this.audio.ensure();
    this.state.running = true;
    this.answerInput.focus();
    try {
      if (this.onRunStart) this.onRunStart();
    } catch (e) {}
  }

  pause() {
    this.state.running = false;
  }

  reset() {
    this.registerScore();
    this.resetRunState();
  }

  setScenario(mode, options = {}) {
    this.registerScore();
    this.state.scenario = mode;
    if (mode === "train") {
      this.state.trainingDigits = this.normalizeTrainingDigits(options.digits);
      this.state.trainingOperation = options.operation || "add";
    }
    this.resetRunState();
  }

  registerScore() {
    return this.storage.registerScore(this.state.scenario, this.state.score);
  }

  spawnHeart() {
    const elapsed = this.getRandomElapsedForHeart();
    const problem = this.problemGen.next(
      this.state.scenario,
      elapsed,
      this.getProblemOptions(),
    );
    const enemy = {
      id: this.state.enemyId++,
      x: randInt(80, this.renderer.canvas.width - 80),
      y: -40,
      speed: scenarios[this.state.scenario].speed,
      drift: randInt(-18, 18),
      label: problem.label,
      answer: problem.answer,
      wobble: Math.random() * Math.PI * 2,
      kind: "heart",
    };
    this.state.enemies.push(enemy);
  }

  spawnMinion() {
    if (!this.state.bossActive) return;
    const problem = this.problemGen.next(
      this.state.scenario,
      this.elapsed,
      this.getProblemOptions(),
    );
    const speed = scenarios[this.state.scenario].speed + 15;
    const enemy = {
      id: this.state.enemyId++,
      x: this.state.boss
        ? this.state.boss.x + randInt(-60, 60)
        : randInt(80, this.renderer.canvas.width - 80),
      y: this.state.boss ? this.state.boss.y + 40 : -40,
      speed,
      drift: randInt(-26, 26),
      label: problem.label,
      answer: problem.answer,
      wobble: Math.random() * Math.PI * 2,
      kind: "minion",
    };
    this.state.enemies.push(enemy);
  }

  spawnEnemy() {
    if (!this.state.bossActive && Math.random() < 0.08) {
      this.spawnHeart();
      return;
    }
    // Recuperação mode: spawn previously-missed problems preferentially
    if (this.state.scenario === "recuperacao" && this.storage) {
      const top = this.storage.getTopFailures(12) || [];
      if (top.length) {
        const pick = top[randInt(0, top.length - 1)];
        const speed = scenarios[this.state.scenario]?.speed || 45;
        const enemy = {
          id: this.state.enemyId++,
          x: randInt(80, this.renderer.canvas.width - 80),
          y: -40,
          speed,
          drift: 0,
          label: pick.label,
          answer: pick.answer,
          wobble: Math.random() * Math.PI * 2,
          kind: "asteroid",
        };
        this.state.enemies.push(enemy);
        return;
      }
    }
    const problem = this.problemGen.next(
      this.state.scenario,
      this.elapsed,
      this.getProblemOptions(),
    );
    const speed = scenarios[this.state.scenario].speed;
    const enemy = {
      id: this.state.enemyId++,
      x: randInt(80, this.renderer.canvas.width - 80),
      y: -40,
      speed,
      drift: 0,
      label: problem.label,
      answer: problem.answer,
      wobble: Math.random() * Math.PI * 2,
      kind: "asteroid",
    };
    this.state.enemies.push(enemy);
  }

  spawnCustom(type, options = {}) {
    const digits = options.digits ?? 1;
    const operation = options.operation ?? "add";
    const elapsed = this.elapsed;
    const problem = this.problemGen.next("train", elapsed, {
      digits,
      operation,
    });
    if (type === "boss") {
      if (!this.state.bossActive) {
        this.spawnBoss();
      }
      if (this.state.boss) {
        this.state.boss.problem = problem;
        this.audio.playSpawn();
        this.renderer.showImpactLabel(
          "CHEFÃO",
          this.state.boss.x,
          this.state.boss.y,
        );
      }
      return;
    }

    if (type === "heart" || type === "vida") {
      const enemy = {
        id: this.state.enemyId++,
        x: randInt(80, this.renderer.canvas.width - 80),
        y: -40,
        speed: options.speed ?? scenarios[this.state.scenario].speed,
        drift: randInt(-18, 18),
        label: problem.label,
        answer: problem.answer,
        wobble: Math.random() * Math.PI * 2,
        kind: "heart",
      };
      this.state.enemies.push(enemy);
      try {
        this.renderer.createLabel(enemy.id);
      } catch (e) {}
      this.audio.playSpawn();
      this.renderer.showImpactLabel("VIDA", enemy.x, enemy.y);
      return;
    }

    if (type === "minion") {
      const enemy = {
        id: this.state.enemyId++,
        x: randInt(80, this.renderer.canvas.width - 80),
        y: -40,
        speed: options.speed ?? scenarios[this.state.scenario].speed + 15,
        drift: randInt(-26, 26),
        label: problem.label,
        answer: problem.answer,
        wobble: Math.random() * Math.PI * 2,
        kind: "minion",
      };
      this.state.enemies.push(enemy);
      try {
        this.renderer.createLabel(enemy.id);
      } catch (e) {}
      this.audio.playSpawn();
      this.renderer.showImpactLabel("MINION", enemy.x, enemy.y);
      return;
    }

    // default: asteroid
    const enemy = {
      id: this.state.enemyId++,
      x: randInt(80, this.renderer.canvas.width - 80),
      y: -40,
      speed: options.speed ?? scenarios[this.state.scenario].speed,
      drift: 0,
      label: problem.label,
      answer: problem.answer,
      wobble: Math.random() * Math.PI * 2,
      kind: "asteroid",
    };
    this.state.enemies.push(enemy);
    try {
      this.renderer.createLabel(enemy.id);
    } catch (e) {}
    this.audio.playSpawn();
    this.renderer.showImpactLabel(String(enemy.label), enemy.x, enemy.y);
  }

  handleShot(rawValue) {
    if (!this.state.running || this.state.gameOver) return;
    const value = rawValue.trim();
    if (!value.length) return;
    // allow comma or dot as decimal separator
    const normalized = value.replace(",", ".");
    const numeric = Number(normalized);
    if (!Number.isFinite(numeric)) {
      this.hud.flashInput(this.answerInput);
      return;
    }

    const matchesAnswer = (expected, provided) => {
      if (!Number.isFinite(expected) || !Number.isFinite(provided))
        return false;
      if (Number.isInteger(expected)) return provided === expected;
      const tol = 1e-4; // accept approximately up to 4 decimal places
      if (Math.abs(provided - expected) <= tol) return true;
      // also accept if they match when rounded to 4 decimals
      return Number(provided.toFixed(4)) === Number(expected.toFixed(4));
    };
    // prioridade no boss
    if (
      this.state.bossActive &&
      this.state.boss &&
      matchesAnswer(this.state.boss.problem.answer, numeric)
    ) {
      this.audio.playShoot();
      this.state.bullets.push({
        targetBoss: true,
        t: 0,
        duration: 0.32,
        x: this.renderer.player.x,
        y: this.renderer.player.y - this.renderer.player.radius,
      });
      this.answerInput.value = "";
      return;
    }
    const candidates = this.state.enemies.filter((e) =>
      matchesAnswer(e.answer, numeric),
    );
    if (!candidates.length) {
      this.hud.flashInput(this.answerInput);
      return;
    }
    candidates.sort((a, b) => b.y - a.y);
    const target = candidates[0];
    this.audio.playShoot();
    this.state.bullets.push({
      targetId: target.id,
      t: 0,
      duration: 0.28,
      x: this.renderer.player.x,
      y: this.renderer.player.y - this.renderer.player.radius,
    });
    this.answerInput.value = "";
  }

  damageBase() {
    if (this.isTraining()) return;
    // one-strike mod: any hit ends the run immediately
    if (this.mods && this.mods.oneStrike) {
      this.audio.playDamage();
      this.finish("base");
      return;
    }
    this.state.baseLife -= 1;
    this.audio.playDamage();
    this.updateHud();
    if (this.state.baseLife <= 0) {
      this.finish("base");
    }
  }

  destroyEnemy(enemy) {
    const idx = this.state.enemies.indexOf(enemy);
    if (idx !== -1) {
      this.state.enemies.splice(idx, 1);
    }
    if (enemy.kind === "heart") {
      this.gainLife();
      return;
    }
    const stage = this.problemGen.currentStageIndex(this.elapsed);
    const points = 10 + stage * 5;
    this.state.score += points;
    // play different sound for asteroid destruction
    if (enemy.kind === "asteroid") {
      this.audio.playDestroy();
      // play coin sound shortly after destruction to indicate reward
      try {
        setTimeout(() => this.audio.playCoin(), 110);
      } catch (e) {}
    } else {
      this.audio.playHit();
    }
    this.updateHud();
    // In Recuperação mode, a successful destruction should reduce the failure count
    try {
      if (this.state.scenario === "recuperacao") {
        this.storage.registerSuccess &&
          this.storage.registerSuccess(enemy.label);
      }
    } catch (e) {}
  }

  finish(reason) {
    if (this.state.gameOver) return;
    this.state.gameOver = true;
    this.state.running = false;
    this.state.bossActive = false;
    this.state.boss = null;
    const brokeRecord = this.registerScore();
    if (reason === "boss") {
      this.hud.showOverlay(
        "Chefao derrotado",
        brokeRecord
          ? "Voce salvou a base e fez um novo recorde!"
          : "Voce salvou a base!",
      );
    } else if (reason === "base") {
      this.hud.showOverlay(
        "Base invadida",
        "Use Reiniciar para tentar novamente.",
      );
    } else {
      this.hud.showOverlay(
        "Partida encerrada",
        "Clique em Reiniciar para jogar de novo.",
      );
    }

    // auto-reset mod: restart automatically after a short delay
    if (this.mods && this.mods.autoReset) {
      try {
        setTimeout(() => {
          this.resetRunState();
          this.start();
        }, 800);
      } catch (e) {}
    }
  }

  update(dt) {
    // decrement time; in training allow time to continue decreasing but track elapsed separately
    if (this.isTraining()) {
      this._trainingElapsed += dt;
      this.state.timeLeft -= dt;
    } else {
      this.state.timeLeft = Math.max(0, this.state.timeLeft - dt);
      // when time runs out in non-training modes, spawn the boss instead of finishing
      if (!this.state.bossSpawned && this.state.timeLeft <= 0) {
        this.spawnBoss();
      }
    }

    const pace = this.getPace();
    this.state.nextSpawn = 1 / pace;
    this.updateHud();

    if (!this.state.bossActive) {
      this.state.spawnTimer -= dt;
      if (this.state.spawnTimer <= 0) {
        this.spawnEnemy();
        this.state.spawnTimer = this.state.nextSpawn;
      }
    } else {
      this.state.bossMinionTimer -= dt;
      if (this.state.bossMinionTimer <= 0) {
        this.spawnMinion();
        this.state.bossMinionTimer = randInt(2, 4);
      }
      if (this.state.boss) {
        this.state.boss.wobble += dt * 1.5;
        this.state.boss.y = Math.min(
          this.state.boss.targetY,
          this.state.boss.y + 40 * dt,
        );
        this.state.boss.x += Math.sin(this.state.boss.wobble) * 20 * dt;
        this.state.boss.x = Math.max(
          60,
          Math.min(this.renderer.canvas.width - 60, this.state.boss.x),
        );
      }
    }

    this.state.enemies = this.state.enemies.filter((enemy) => {
      enemy.wobble += dt * 2;
      enemy.y += enemy.speed * dt;
      enemy.x += Math.sin(enemy.wobble) * enemy.drift * dt;
      enemy.x = Math.max(
        50,
        Math.min(this.renderer.canvas.width - 50, enemy.x),
      );

      if (this.collidesWithPlayer(enemy)) {
        if (enemy.kind === "heart") {
          this.gainLife();
        } else {
          this.damageBase();
        }
        return false;
      }

      if (enemy.y >= this.renderer.barrierY) {
        if (enemy.kind === "asteroid") {
          this.renderer.showImpactLabel(
            String(enemy.answer),
            enemy.x,
            this.renderer.barrierY,
          );
        }
        if (enemy.kind !== "heart") {
          // register missed problem for recovery tracking, but skip in train/sandbox
          try {
            if (
              this.state.scenario !== "train" &&
              this.state.scenario !== "sandbox"
            ) {
              this.storage.registerFailure &&
                this.storage.registerFailure(enemy.label, enemy.answer);
            }
          } catch (e) {}
          this.damageBase();
        }
        return false;
      }
      return true;
    });

    this.state.bullets = this.state.bullets.filter((bullet) => {
      bullet.t += dt;
      if (bullet.targetBoss) {
        const boss = this.state.boss;
        if (!boss) return false;
        const pct = Math.min(1, bullet.t / bullet.duration);
        bullet.x = lerp(this.renderer.player.x, boss.x, pct);
        bullet.y = lerp(
          this.renderer.player.y - this.renderer.player.radius,
          boss.y,
          pct,
        );
        if (pct >= 1) {
          this.hitBoss();
          return false;
        }
        return true;
      }
      const target = this.state.enemies.find((e) => e.id === bullet.targetId);
      if (!target) return false;
      const pct = Math.min(1, bullet.t / bullet.duration);
      bullet.x = lerp(this.renderer.player.x, target.x, pct);
      bullet.y = lerp(
        this.renderer.player.y - this.renderer.player.radius,
        target.y,
        pct,
      );
      if (pct >= 1) {
        this.destroyEnemy(target);
        return false;
      }
      return true;
    });
  }

  updateHud() {
    const paceValue =
      this.state.nextSpawn > 0 ? (1 / this.state.nextSpawn).toFixed(1) : "0";
    const best = this.storage.getBest(this.state.scenario);
    const health = this.getHealthStatus();
    const bossPct =
      this.state.boss && this.state.boss.maxHp > 0
        ? Math.round((this.state.boss.hp / this.state.boss.maxHp) * 100)
        : 0;
    const scenarioLabel = this.getScenarioLabel();
    const baseLife = this.isTraining() ? "INF" : this.state.baseLife;
    const timeDisplay = this.isTraining()
      ? "INF"
      : formatTime(this.state.timeLeft);
    this.hud.update(
      {
        baseLife,
        score: this.state.score,
        timeLeft: this.state.timeLeft,
        scenario: scenarioLabel,
        healthLabel: health.label,
        healthClass: health.cls,
        wave: this.getWave(),
        bossActive: this.state.bossActive,
        bossHpPct: bossPct,
      },
      paceValue,
      best,
      timeDisplay,
    );
  }

  step(dt) {
    if (this.state.running && !this.state.gameOver) {
      this.update(dt);
    }
    this.renderer.draw(this.state);
    this.updateHud();
  }
}
