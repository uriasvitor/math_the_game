import { scenarios, TOTAL_TIME, formatTime } from './config.js';
import { ProblemGenerator } from './problems.js';

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export class Game {
  constructor({ renderer, hud, audio, storage, answerInput }) {
    this.renderer = renderer;
    this.hud = hud;
    this.audio = audio;
    this.storage = storage;
    this.answerInput = answerInput;
    this.problemGen = new ProblemGenerator();

    this.state = this.createInitialState();
    this.hud.setPhaseLabel(scenarios[this.state.scenario].name);
  }

  createInitialState() {
    return {
      running: false,
      gameOver: false,
      enemies: [],
      bullets: [],
      score: 0,
      baseLife: 3,
      scenario: 'add',
      spawnTimer: 0,
      nextSpawn: scenarios.add.spawn,
      speedBoost: 0,
      enemyId: 1,
      timeLeft: TOTAL_TIME,
      totalTime: TOTAL_TIME
    };
  }

  get elapsed() {
    return this.state.totalTime - this.state.timeLeft;
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
      totalTime: TOTAL_TIME
    };
    this.hud.hideOverlay();
    this.hud.setPhaseLabel(scenarios[this.state.scenario].name);
    this.answerInput.value = '';
    this.updateHud();
  }

  start() {
    this.audio.ensure();
    this.state.running = true;
    this.answerInput.focus();
  }

  pause() {
    this.state.running = false;
  }

  reset() {
    this.registerScore();
    this.resetRunState();
  }

  setScenario(mode) {
    this.registerScore();
    this.state.scenario = mode;
    this.resetRunState();
  }

  registerScore() {
    return this.storage.registerScore(this.state.scenario, this.state.score);
  }

  spawnEnemy() {
    const problem = this.problemGen.next(this.state.scenario, this.elapsed);
    const speed = scenarios[this.state.scenario].speed + this.state.speedBoost;
    const enemy = {
      id: this.state.enemyId++,
      x: randInt(80, this.renderer.canvas.width - 80),
      y: -40,
      speed,
      drift: randInt(-18, 18),
      label: problem.label,
      answer: problem.answer,
      wobble: Math.random() * Math.PI * 2
    };
    this.state.enemies.push(enemy);
    this.state.speedBoost = Math.min(45, this.state.speedBoost + 0.5);
    this.state.nextSpawn = Math.max(0.8, scenarios[this.state.scenario].spawn - this.state.speedBoost * 0.01);
  }

  handleShot(rawValue) {
    if (!this.state.running || this.state.gameOver) return;
    const value = rawValue.trim();
    if (!value.length) return;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      this.hud.flashInput(this.answerInput);
      return;
    }
    const candidates = this.state.enemies.filter(e => e.answer === numeric);
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
      y: this.renderer.player.y - this.renderer.player.radius
    });
    this.answerInput.value = '';
  }

  damageBase() {
    this.state.baseLife -= 1;
    this.audio.playDamage();
    if (this.state.baseLife <= 0) {
      this.finish('base');
    }
  }

  destroyEnemy(enemy) {
    const idx = this.state.enemies.indexOf(enemy);
    if (idx !== -1) {
      this.state.enemies.splice(idx, 1);
    }
    const stage = this.problemGen.currentStageIndex(this.elapsed);
    const points = 10 + stage * 5;
    this.state.score += points;
    this.audio.playHit();
  }

  finish(reason) {
    if (this.state.gameOver) return;
    this.state.gameOver = true;
    this.state.running = false;
    const brokeRecord = this.registerScore();
    if (reason === 'time') {
      this.hud.showOverlay(
        'Tempo esgotado',
        brokeRecord
          ? 'Voce defendeu a base por 3 minutos e fez um novo recorde!'
          : 'Voce defendeu a base por 3 minutos!'
      );
    } else if (reason === 'base') {
      this.hud.showOverlay('Base invadida', 'Use Reiniciar para tentar novamente.');
    } else {
      this.hud.showOverlay('Partida encerrada', 'Clique em Reiniciar para jogar de novo.');
    }
  }

  update(dt) {
    this.state.timeLeft = Math.max(0, this.state.timeLeft - dt);
    if (this.state.timeLeft === 0) {
      this.finish('time');
      return;
    }

    this.state.spawnTimer -= dt;
    if (this.state.spawnTimer <= 0) {
      this.spawnEnemy();
      this.state.spawnTimer = this.state.nextSpawn;
    }

    this.state.enemies = this.state.enemies.filter(enemy => {
      enemy.wobble += dt * 2;
      enemy.y += enemy.speed * dt;
      enemy.x += Math.sin(enemy.wobble) * enemy.drift * dt;
      enemy.x = Math.max(50, Math.min(this.renderer.canvas.width - 50, enemy.x));

      if (enemy.y >= this.renderer.player.y - 26) {
        this.damageBase();
        return false;
      }
      return true;
    });

    this.state.bullets = this.state.bullets.filter(bullet => {
      bullet.t += dt;
      const target = this.state.enemies.find(e => e.id === bullet.targetId);
      if (!target) return false;
      const pct = Math.min(1, bullet.t / bullet.duration);
      bullet.x = lerp(this.renderer.player.x, target.x, pct);
      bullet.y = lerp(this.renderer.player.y - this.renderer.player.radius, target.y, pct);
      if (pct >= 1) {
        this.destroyEnemy(target);
        return false;
      }
      return true;
    });
  }

  updateHud() {
    const paceValue = this.state.nextSpawn > 0 ? (1 / this.state.nextSpawn).toFixed(1) : '0';
    const best = this.storage.getBest(this.state.scenario);
    this.hud.update(
      {
        baseLife: this.state.baseLife,
        score: this.state.score,
        timeLeft: this.state.timeLeft,
        scenario: scenarios[this.state.scenario].name
      },
      paceValue,
      best,
      formatTime(this.state.timeLeft)
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
