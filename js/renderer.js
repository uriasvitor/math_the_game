export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.player = {
      x: canvas.width / 2,
      y: canvas.height - 80,
      radius: 18
    };
  }

  draw(state) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawBase();
    this.drawPlayer();
    this.drawEnemies(state.enemies);
    this.drawBullets(state.bullets);
  }

  drawGrid() {
    const { ctx, canvas } = this;
    ctx.save();
    ctx.strokeStyle = 'rgba(78, 240, 200, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 40; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawBase() {
    const { ctx, canvas } = this;
    ctx.save();
    ctx.fillStyle = '#071629';
    ctx.fillRect(0, canvas.height - 70, canvas.width, 70);
    ctx.fillStyle = '#12314e';
    ctx.fillRect(0, canvas.height - 90, canvas.width, 22);
    ctx.fillStyle = '#4ef0c8';
    ctx.fillRect(canvas.width / 2 - 80, canvas.height - 78, 160, 12);
    ctx.restore();
  }

  drawPlayer() {
    const { ctx } = this;
    const p = this.player;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = '#4ef0c8';
    ctx.beginPath();
    ctx.moveTo(0, -p.radius);
    ctx.lineTo(p.radius + 8, p.radius);
    ctx.lineTo(-p.radius - 8, p.radius);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0b1d33';
    ctx.beginPath();
    ctx.arc(0, 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawEnemies(enemies) {
    const { ctx } = this;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    enemies.forEach(enemy => {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      const mainFont = '17px "Space Grotesk", sans-serif';
      const subFont = '13px "Space Grotesk", sans-serif';
      ctx.font = mainFont;
      const padding = 20;
      const labelWidth = ctx.measureText(enemy.label).width;
      const cardWidth = Math.max(70, labelWidth + padding);
      const cardHeight = 42;

      ctx.fillStyle = '#ff9f43';
      ctx.shadowColor = 'rgba(255, 159, 67, 0.5)';
      ctx.shadowBlur = 10;
      this.drawRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 12);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#041226';
      ctx.font = mainFont;
      ctx.fillText(enemy.label, 0, -4);

      ctx.fillStyle = '#e8eef2';
      ctx.font = subFont;
      ctx.fillText('= ?', 0, 14);
      ctx.restore();
    });
    ctx.restore();
  }

  drawBullets(bullets) {
    const { ctx } = this;
    const p = this.player;
    ctx.save();
    ctx.strokeStyle = '#4ef0c8';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    bullets.forEach(bullet => {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - p.radius);
      ctx.lineTo(bullet.x, bullet.y);
      ctx.stroke();

      ctx.fillStyle = '#4ef0c8';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  drawRoundedRect(x, y, w, h, r) {
    const { ctx } = this;
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
