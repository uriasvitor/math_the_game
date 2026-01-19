import * as THREE from "https://unpkg.com/three@0.159.0/build/three.module.js";

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = 960;
    this.height = 560;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.player = {
      x: this.width / 2,
      y: this.height - 80,
      radius: 18,
    };

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.shadowMap.enabled = false;
    this.camera = new THREE.OrthographicCamera(
      -this.width / 2,
      this.width / 2,
      this.height / 2,
      -this.height / 2,
      -500,
      1500,
    );
    this.camera.position.set(0, 400, 400);
    this.camera.lookAt(0, 0, 0);

    this.buildStarfield();
    this.setupLights();
    this.setupGround();
    this.barrierY = this.height - 10;
    this.barrierLine = this.createBarrierLine();
    this.scene.add(this.barrierLine);

    this.enemies = new Map();
    this.bullets = new Map();
    this.labels = new Map();
    this.bossMesh = null;

    this.playerTexture = this.createFallbackPlayerTexture();
    this.enemyTexture = this.createFallbackEnemyTexture();
    this.minionTexture = this.createFallbackMinionTexture();
    this.heartTexture = this.createFallbackHeartTexture();
    this.bossTexture = this.createFallbackBossTexture();
    this.loadPlayerTexture();
    this.loadEnemyTexture();
    this.loadMinionTexture();
    this.loadHeartTexture();
    this.loadBossTexture();
    this.playerMesh = this.createPlayerSprite();
    this.scene.add(this.playerMesh);

    this.labelLayer = document.createElement("div");
    this.labelLayer.className = "label-layer";
    this.canvas.parentElement?.appendChild(this.labelLayer);

    this.resize();
  }

  setupLights() {
    const hemi = new THREE.HemisphereLight(0x4ef0c8, 0x060a16, 0.2);
    this.scene.add(hemi);

    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-200, 260, 200);
    this.scene.add(fill);
  }

  setupGround() {
    const planeGeo = new THREE.PlaneGeometry(this.width, this.height);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.0001,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);
  }

  buildStarfield() {
    const count = 400;
    const positions = [];
    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * this.width * 1.6,
        (Math.random() - 0.5) * 600,
        (Math.random() - 0.5) * this.height * 1.6,
      );
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(geo, mat);
    this.scene.add(stars);
  }
  loadPlayerTexture() {
    const loader = new THREE.TextureLoader();
    loader.load(
      "images/ship.png",
      (tex) => {
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        this.playerTexture = tex;
        if (this.playerMesh && this.playerMesh.material) {
          this.playerMesh.material.map = tex;
          this.playerMesh.material.needsUpdate = true;
        }
      },
      undefined,
      () => {
        // fallback canvas
        this.playerTexture = this.createFallbackPlayerTexture();
      },
    );
  }

  loadEnemyTexture() {
    const loader = new THREE.TextureLoader();
    loader.load(
      "images/chars/asteroid.png",
      (tex) => {
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        this.enemyTexture = tex;
        this.applyTextureToEnemies("asteroid", tex);
      },
      undefined,
      () => {
        this.enemyTexture = this.createFallbackEnemyTexture();
      },
    );
  }

  loadMinionTexture() {
    const loader = new THREE.TextureLoader();
    loader.load(
      "images/chars/ship_enemie.png",
      (tex) => {
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        this.minionTexture = tex;
        this.applyTextureToEnemies("minion", tex);
      },
      undefined,
      () => {
        this.minionTexture = this.createFallbackMinionTexture();
      },
    );
  }

  loadHeartTexture() {
    const loader = new THREE.TextureLoader();
    loader.load(
      "images/chars/heart.png",
      (tex) => {
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        this.heartTexture = tex;
        this.applyTextureToEnemies("heart", tex);
      },
      undefined,
      () => {
        this.heartTexture = this.createFallbackHeartTexture();
      },
    );
  }

  loadBossTexture() {
    const loader = new THREE.TextureLoader();
    loader.load(
      "images/chars/boss.png",
      (tex) => {
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        this.bossTexture = tex;
        if (this.bossMesh && this.bossMesh.material) {
          this.bossMesh.material.map = tex;
          this.bossMesh.material.needsUpdate = true;
        }
      },
      undefined,
      () => {
        this.bossTexture = this.createFallbackBossTexture();
      },
    );
  }

  createFallbackPlayerTexture() {
    const size = 96;
    const cnv = document.createElement("canvas");
    cnv.width = cnv.height = size;
    const c = cnv.getContext("2d");
    c.imageSmoothingEnabled = false;

    // corpo da nave
    c.fillStyle = "#cfd8e3";
    c.fillRect(42, 18, 12, 60);
    c.fillStyle = "#8fa4b6";
    c.fillRect(44, 24, 8, 40);

    // cockpit
    c.fillStyle = "#6feec4";
    c.fillRect(44, 22, 8, 10);

    // asas
    c.fillStyle = "#9aa7b5";
    c.fillRect(30, 40, 36, 10);
    c.fillRect(34, 50, 28, 8);

    // fogo traseiro
    c.fillStyle = "#ff934f";
    c.fillRect(44, 78, 8, 6);
    c.fillStyle = "#ff5c5c";
    c.fillRect(44, 84, 8, 6);

    const tex = new THREE.CanvasTexture(cnv);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }
  createFallbackEnemyTexture() {
    const size = 64;
    const cnv = document.createElement("canvas");
    cnv.width = cnv.height = size;
    const c = cnv.getContext("2d");
    c.imageSmoothingEnabled = false;
    c.fillStyle = "#6c6f76";
    c.fillRect(16, 16, 32, 32);
    c.fillStyle = "#4e5158";
    c.fillRect(20, 20, 8, 8);
    c.fillRect(36, 28, 10, 6);
    c.fillStyle = "#858a92";
    c.fillRect(24, 34, 14, 10);
    const tex = new THREE.CanvasTexture(cnv);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  createFallbackMinionTexture() {
    const size = 64;
    const cnv = document.createElement("canvas");
    cnv.width = cnv.height = size;
    const c = cnv.getContext("2d");
    c.imageSmoothingEnabled = false;
    c.fillStyle = "#9aa7b5";
    c.fillRect(28, 10, 8, 30);
    c.fillStyle = "#6feec4";
    c.fillRect(28, 14, 8, 8);
    c.fillStyle = "#7a8694";
    c.fillRect(16, 24, 32, 8);
    c.fillStyle = "#ff934f";
    c.fillRect(28, 42, 8, 6);
    const tex = new THREE.CanvasTexture(cnv);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  createFallbackHeartTexture() {
    const size = 64;
    const cnv = document.createElement("canvas");
    cnv.width = cnv.height = size;
    const c = cnv.getContext("2d");
    c.imageSmoothingEnabled = false;

    c.fillStyle = "#ff6f9f";
    c.fillRect(20, 20, 10, 10);
    c.fillRect(34, 20, 10, 10);
    c.fillRect(22, 30, 20, 8);
    c.fillRect(26, 38, 12, 8);

    const tex = new THREE.CanvasTexture(cnv);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  createFallbackBossTexture() {
    const size = 128;
    const cnv = document.createElement("canvas");
    cnv.width = cnv.height = size;
    const c = cnv.getContext("2d");
    c.imageSmoothingEnabled = false;

    c.fillStyle = "#ff8a7a";
    c.fillRect(58, 16, 12, 90);
    c.fillStyle = "#ff6f6f";
    c.fillRect(60, 26, 8, 70);

    // cockpit
    c.fillStyle = "#ffd29f";
    c.fillRect(60, 24, 8, 12);

    // asas
    c.fillStyle = "#c95b5b";
    c.fillRect(32, 48, 64, 12);
    c.fillRect(38, 60, 52, 10);

    // fogo
    c.fillStyle = "#ffcf4f";
    c.fillRect(60, 106, 8, 8);
    c.fillStyle = "#ff9f2f";
    c.fillRect(60, 114, 8, 8);

    const tex = new THREE.CanvasTexture(cnv);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  createSpriteFromTexture(tex, scale = { x: 60, y: 60 }) {
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(scale.x, scale.y, 1);
    return sprite;
  }

  createSprite(colorTop, colorBody, scale = { x: 28, y: 32 }) {
    const size = 24;
    const cnv = document.createElement("canvas");
    cnv.width = cnv.height = size;
    const c = cnv.getContext("2d");
    c.imageSmoothingEnabled = false;
    c.fillStyle = colorBody;
    c.fillRect(6, 12, 12, 10);
    c.fillStyle = colorTop;
    c.fillRect(8, 6, 8, 8);
    const tex = new THREE.CanvasTexture(cnv);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return this.createSpriteFromTexture(tex, scale);
  }

  createPlayerSprite() {
    return this.createSpriteFromTexture(this.playerTexture, { x: 120, y: 120 });
  }

  createEnemySprite(kind) {
    if (kind === "minion") {
      return this.createSpriteFromTexture(this.minionTexture, { x: 80, y: 80 });
    }
    if (kind === "heart") {
      return this.createSpriteFromTexture(this.heartTexture, { x: 70, y: 70 });
    }
    return this.createSpriteFromTexture(this.enemyTexture, { x: 90, y: 90 });
  }

  createBossSprite() {
    return this.createSpriteFromTexture(this.bossTexture, { x: 160, y: 160 });
  }

  createBulletMesh() {
    const mat = new THREE.SpriteMaterial({ color: 0x4ef0c8 });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(8, 8, 1);
    return sprite;
  }

  resize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  toWorld(x, y) {
    return new THREE.Vector3(x - this.width / 2, 0, y - this.height / 2);
  }

  createBarrierLine() {
    const y = this.barrierY;
    const start = this.toWorld(0, y);
    const end = this.toWorld(this.width, y);
    const lineGeo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xb7f8ff,
      transparent: true,
      opacity: 0.55,
    });
    const line = new THREE.Line(lineGeo, lineMat);
    line.position.y = 2;

    const bandGeo = new THREE.PlaneGeometry(this.width, 6);
    const bandMat = new THREE.MeshBasicMaterial({
      color: 0xb7f8ff,
      transparent: true,
      opacity: 0.18,
    });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.rotation.x = -Math.PI / 2;
    band.position.set(0, 1, start.z);

    const group = new THREE.Group();
    group.add(band);
    group.add(line);
    group.userData.band = band;
    group.userData.edge = line;
    return group;
  }

  updateBarrierLine() {
    if (!this.barrierLine) return;
    const y = this.barrierY;
    const start = this.toWorld(0, y);
    const end = this.toWorld(this.width, y);
    const edge = this.barrierLine.userData.edge;
    const band = this.barrierLine.userData.band;
    const pos = edge.geometry.attributes.position.array;
    pos[0] = start.x;
    pos[1] = 0;
    pos[2] = start.z;
    pos[3] = end.x;
    pos[4] = 0;
    pos[5] = end.z;
    edge.geometry.attributes.position.needsUpdate = true;
    edge.position.y = 2;
    if (band) {
      band.position.z = start.z;
      band.position.y = 1;
    }
  }

  syncPlayer() {
    const pos = this.toWorld(this.player.x, this.player.y);
    this.playerMesh.position.set(pos.x, 18, pos.z);
    this.updateBarrierLine();
  }

  syncBoss(boss) {
    if (!boss) {
      if (this.bossMesh) {
        this.scene.remove(this.bossMesh);
        this.bossMesh = null;
      }
      this.removeLabel("boss");
      return;
    }
    if (!this.bossMesh) {
      this.bossMesh = this.createBossSprite();
      this.scene.add(this.bossMesh);
      this.createLabel("boss");
    }
    const pos = this.toWorld(boss.x, boss.y);
    this.bossMesh.position.set(pos.x, 20, pos.z);
    this.updateLabel(
      "boss",
      boss.problem?.label ?? "???",
      this.bossMesh.position,
      -10,
    );
  }

  syncEnemies(enemies) {
    const activeIds = new Set(enemies.map((e) => e.id));
    for (const [id, obj] of this.enemies) {
      if (!activeIds.has(id)) {
        this.scene.remove(obj);
        this.enemies.delete(id);
        this.removeLabel(id);
      }
    }

    enemies.forEach((enemy) => {
      if (!this.enemies.has(enemy.id)) {
        const kind = enemy.kind || "asteroid";
        const mesh = this.createEnemySprite(kind);
        mesh.userData.kind = kind;
        this.scene.add(mesh);
        this.enemies.set(enemy.id, mesh);
        this.createLabel(enemy.id);
      }
      const mesh = this.enemies.get(enemy.id);
      const pos = this.toWorld(enemy.x, enemy.y);
      mesh.position.set(pos.x, 18, pos.z);
      this.updateLabel(enemy.id, enemy.label, mesh.position, this.getLabelOffset(enemy.kind));
    });
  }

  getLabelOffset(kind) {
    if (kind === "asteroid") return -50;
    if (kind === "minion") return -42;
    if (kind === "heart") return -38;
    return -32;
  }

  syncBullets(bullets) {
    const activeIds = new Set(bullets.map((_, idx) => idx));
    for (const [idx, mesh] of this.bullets) {
      if (!activeIds.has(idx)) {
        this.scene.remove(mesh);
        this.bullets.delete(idx);
      }
    }

    bullets.forEach((bullet, idx) => {
      if (!this.bullets.has(idx)) {
        const mesh = this.createBulletMesh();
        this.scene.add(mesh);
        this.bullets.set(idx, mesh);
      }
      const mesh = this.bullets.get(idx);
      const pos = this.toWorld(bullet.x, bullet.y);
      mesh.position.set(pos.x, 18, pos.z);
    });
  }

  createLabel(id) {
    if (this.labels.has(id)) return;
    const el = document.createElement("div");
    el.className = "enemy-label";
    this.labelLayer.appendChild(el);
    this.labels.set(id, el);
  }

  removeLabel(id) {
    const el = this.labels.get(id);
    if (el?.parentElement) {
      el.parentElement.removeChild(el);
    }
    this.labels.delete(id);
  }

  updateLabel(id, text, position, offsetY = -24) {
    const el = this.labels.get(id);
    if (!el) return;
    el.textContent = text;
    const projected = position.clone().project(this.camera);
    const x = (projected.x * 0.5 + 0.5) * this.canvas.clientWidth;
    const y = (-projected.y * 0.5 + 0.5) * this.canvas.clientHeight;
    el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y + offsetY}px)`;
  }

  draw(state) {
    this.resize();
    this.syncPlayer();
    this.syncBoss(state.bossActive ? state.boss : null);
    this.syncEnemies(state.enemies);
    this.syncBullets(state.bullets);
    this.renderer.render(this.scene, this.camera);
  }

  showImpactLabel(text, x, y) {
    if (!this.labelLayer) return;
    const el = document.createElement("div");
    el.className = "impact-label";
    el.textContent = text;
    this.labelLayer.appendChild(el);

    const pos = this.toWorld(x, y);
    const projected = pos.clone().project(this.camera);
    const screenX = (projected.x * 0.5 + 0.5) * this.canvas.clientWidth;
    const screenY = (-projected.y * 0.5 + 0.5) * this.canvas.clientHeight;
    el.style.transform = `translate(-50%, -50%) translate(${screenX}px, ${screenY - 10}px)`;
    el.style.opacity = "0.6";
    setTimeout(() => {
      el.style.opacity = "0";
    }, 350);
    setTimeout(() => {
      if (el.parentElement) el.parentElement.removeChild(el);
    }, 900);
  }
  applyTextureToEnemies(kind, texture) {
    for (const mesh of this.enemies.values()) {
      if (mesh.userData.kind === kind && mesh.material) {
        mesh.material.map = texture;
        mesh.material.needsUpdate = true;
      }
    }
  }
}
