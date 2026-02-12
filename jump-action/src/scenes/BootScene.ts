import Phaser from "phaser";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_SIZE,
  PLAYER_TEX_HEIGHT,
  GROUND_TILE_WIDTH,
  GROUND_HEIGHT,
  COIN_SIZE,
  QUIZ_ITEM_SIZE,
  COLOR_GROUND_TOP,
  COLOR_COIN,
  COLOR_MOUNTAIN_FAR,
  COLOR_MOUNTAIN_MID,
  COLOR_MOUNTAIN_NEAR,
  SKY_TOP_COLOR,
  SKY_MID_COLOR,
  SKY_BOT_COLOR,
} from "../constants";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create(): void {
    this.createSkyTexture();
    this.createPlayerTexture();
    this.createGroundTileTexture();
    this.createCoinTexture();
    this.createMeteorTexture();
    this.createMountainTextures();
    this.scene.start("GameScene");
  }

  // ── Sky gradient texture ──

  private createSkyTexture(): void {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;
    const g = this.add.graphics();

    const top = SKY_TOP_COLOR;
    const mid = SKY_MID_COLOR;
    const bot = SKY_BOT_COLOR;

    for (let y = 0; y < h; y++) {
      const t = y / (h - 1);
      let r: number, gr: number, b: number;
      if (t < 0.5) {
        const lt = t / 0.5;
        r = Math.round(top.r + (mid.r - top.r) * lt);
        gr = Math.round(top.g + (mid.g - top.g) * lt);
        b = Math.round(top.b + (mid.b - top.b) * lt);
      } else {
        const lt = (t - 0.5) / 0.5;
        r = Math.round(mid.r + (bot.r - mid.r) * lt);
        gr = Math.round(mid.g + (bot.g - mid.g) * lt);
        b = Math.round(mid.b + (bot.b - mid.b) * lt);
      }
      g.fillStyle((r << 16) | (gr << 8) | b);
      g.fillRect(0, y, w, 1);
    }

    g.generateTexture("sky_gradient", w, h);
    g.destroy();
  }

  // ── Hoodie body drawing ──

  private drawHoodieBody(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    topPad: number,
    eyeStyle: "normal" | "squint" | "dead" | "open" = "normal"
  ): void {
    const bodyX = 4;
    const bodyY = topPad;
    const bodyW = 32;
    const bodyH = 38;
    const tlr = 14;
    const trr = 14;
    const blr = 4;
    const brr = 4;

    // Body gradient (top lighter, bottom darker)
    const topColor = { r: 0xd0, g: 0x44, b: 0x35 };
    const botColor = { r: 0xa0, g: 0x28, b: 0x1e };
    for (let row = 0; row < bodyH; row++) {
      const t = row / (bodyH - 1);
      const r = Math.round(topColor.r + (botColor.r - topColor.r) * t);
      const gr = Math.round(topColor.g + (botColor.g - topColor.g) * t);
      const b = Math.round(topColor.b + (botColor.b - topColor.b) * t);
      g.fillStyle((r << 16) | (gr << 8) | b);
      // Clip to rounded rect area per row
      const ry = bodyY + row;
      let leftEdge = bodyX;
      let rightEdge = bodyX + bodyW;

      // Top-left corner
      if (row < tlr) {
        const dy = tlr - row;
        const dx = tlr - Math.sqrt(Math.max(0, tlr * tlr - dy * dy));
        leftEdge = Math.max(leftEdge, bodyX + dx);
      }
      // Top-right corner
      if (row < trr) {
        const dy = trr - row;
        const dx = trr - Math.sqrt(Math.max(0, trr * trr - dy * dy));
        rightEdge = Math.min(rightEdge, bodyX + bodyW - dx);
      }
      // Bottom-left corner
      if (row > bodyH - blr) {
        const dy = row - (bodyH - blr);
        const dx = blr - Math.sqrt(Math.max(0, blr * blr - dy * dy));
        leftEdge = Math.max(leftEdge, bodyX + dx);
      }
      // Bottom-right corner
      if (row > bodyH - brr) {
        const dy = row - (bodyH - brr);
        const dx = brr - Math.sqrt(Math.max(0, brr * brr - dy * dy));
        rightEdge = Math.min(rightEdge, bodyX + bodyW - dx);
      }

      if (rightEdge > leftEdge) {
        g.fillRect(leftEdge, ry, rightEdge - leftEdge, 1);
      }
    }

    // Hood edge shadow (dark arc at top)
    g.lineStyle(2, 0x7a1a12, 0.5);
    g.beginPath();
    g.arc(cx + 2, bodyY + tlr, tlr + 2, -Math.PI * 0.8, -Math.PI * 0.2, false);
    g.strokePath();

    // Outline
    g.lineStyle(2, 0x922b21);
    g.beginPath();
    g.moveTo(bodyX + tlr, bodyY);
    g.lineTo(bodyX + bodyW - trr, bodyY);
    g.arc(bodyX + bodyW - trr, bodyY + trr, trr, -Math.PI / 2, 0, false);
    g.lineTo(bodyX + bodyW, bodyY + bodyH - brr);
    g.arc(bodyX + bodyW - brr, bodyY + bodyH - brr, brr, 0, Math.PI / 2, false);
    g.lineTo(bodyX + blr, bodyY + bodyH);
    g.arc(bodyX + blr, bodyY + bodyH - blr, blr, Math.PI / 2, Math.PI, false);
    g.lineTo(bodyX, bodyY + tlr);
    g.arc(bodyX + tlr, bodyY + tlr, tlr, Math.PI, -Math.PI / 2, false);
    g.closePath();
    g.strokePath();

    // Pocket line
    g.lineStyle(1, 0x922b21, 0.5);
    g.lineBetween(bodyX + 6, bodyY + 30, bodyX + bodyW - 6, bodyY + 30);

    // Center seam (zipper line)
    const seamX = cx + 7;
    const seamTop = bodyY + 24;
    const seamBot = bodyY + bodyH - 2;
    g.lineStyle(2, 0x922b21);
    g.lineBetween(seamX, seamTop, seamX, seamBot);

    // "K" on right chest
    const kx = seamX + 3;
    const ky = bodyY + 24;
    const kh = 6;
    g.lineStyle(1.2, 0xffffff);
    g.lineBetween(kx, ky, kx, ky + kh);
    g.lineBetween(kx + 4, ky, kx, ky + kh * 0.45);
    g.lineBetween(kx, ky + kh * 0.45, kx + 4, ky + kh);

    // Face (white oval)
    const faceCx = cx + 2;
    const faceCy = topPad + 14;
    const faceRx = 11;
    const faceRy = 10;
    g.fillStyle(0xffffff);
    g.fillEllipse(faceCx, faceCy, faceRx * 2, faceRy * 2);

    // Eyes
    const eyeY = topPad + 13;
    if (eyeStyle === "squint") {
      const es = 3;
      g.lineStyle(1.8, 0x222222);
      const lx = cx + 3;
      g.lineBetween(lx - es, eyeY - es, lx + es, eyeY);
      g.lineBetween(lx + es, eyeY, lx - es, eyeY + es);
      const rx = cx + 11;
      g.lineBetween(rx + es, eyeY - es, rx - es, eyeY);
      g.lineBetween(rx - es, eyeY, rx + es, eyeY + es);
    } else if (eyeStyle === "dead") {
      const es = 2.5;
      g.lineStyle(1.8, 0x222222);
      const lx = cx + 4;
      g.lineBetween(lx - es, eyeY - es, lx + es, eyeY + es);
      g.lineBetween(lx + es, eyeY - es, lx - es, eyeY + es);
      const rx = cx + 11;
      g.lineBetween(rx - es, eyeY - es, rx + es, eyeY + es);
      g.lineBetween(rx + es, eyeY - es, rx - es, eyeY + es);
    } else if (eyeStyle === "open") {
      // Surprised "o" mouth eyes
      g.fillStyle(0xffffff);
      g.fillCircle(cx + 2, eyeY, 5);
      g.fillCircle(cx + 10, eyeY, 4);
      g.fillStyle(0x222222);
      g.fillCircle(cx + 4, eyeY - 1, 2.5);
      g.fillCircle(cx + 11, eyeY - 1, 2);
      // White highlight dots
      g.fillStyle(0xffffff);
      g.fillCircle(cx + 3, eyeY - 2, 1);
      g.fillCircle(cx + 10, eyeY - 2, 0.8);
    } else {
      g.fillStyle(0xffffff);
      g.fillCircle(cx + 2, eyeY, 5);
      g.fillCircle(cx + 10, eyeY, 4);
      g.fillStyle(0x222222);
      g.fillCircle(cx + 4, eyeY, 2.5);
      g.fillCircle(cx + 11, eyeY, 2);
      // White highlight dots
      g.fillStyle(0xffffff);
      g.fillCircle(cx + 3, eyeY - 1, 1);
      g.fillCircle(cx + 10, eyeY - 1, 0.8);
    }

    // Blush
    g.fillStyle(0xffaaaa, 0.5);
    g.fillCircle(faceCx - faceRx * 0.6, faceCy + faceRy * 0.5, 2.5);
    g.fillCircle(faceCx + faceRx * 0.65, faceCy + faceRy * 0.5, 2.5);
  }

  private drawLeg(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    shoeH: number,
    r: number
  ): void {
    g.fillStyle(0xc0392b);
    g.fillRoundedRect(x, y, w, h, { tl: 0, tr: 0, bl: r, br: r });
    // Shoe
    g.fillStyle(0x922b21);
    g.fillRoundedRect(x, y + h - shoeH, w, shoeH, { tl: 0, tr: 0, bl: r, br: r });
    // Shoe laces
    g.lineStyle(0.8, 0xffffff, 0.6);
    g.lineBetween(x + 1, y + h - shoeH + 1, x + w - 1, y + h - shoeH + 1);
    if (shoeH > 2) {
      g.lineBetween(x + 1, y + h - shoeH + 3, x + w - 1, y + h - shoeH + 3);
    }
    // Outline
    g.lineStyle(2, 0x922b21);
    g.strokeRoundedRect(x, y, w, h, { tl: 0, tr: 0, bl: r, br: r });
  }

  // ── Character shadow ──
  private drawShadow(g: Phaser.GameObjects.Graphics, cx: number, bottomY: number): void {
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(cx, bottomY + 2, 26, 6);
  }

  private createPlayerTexture(): void {
    const w = PLAYER_SIZE;
    const h = PLAYER_TEX_HEIGHT;
    const topPad = 3;
    const legR = 3;

    // --- Run frames (4 frames, exaggerated leg movement) ---
    const legConfigs = [
      // frame 0: left extended far, right tucked
      { leftY: 36, leftH: 14, rightY: 42, rightH: 8 },
      // frame 1: both mid (passing)
      { leftY: 39, leftH: 11, rightY: 39, rightH: 11 },
      // frame 2: right extended far, left tucked
      { leftY: 42, leftH: 8, rightY: 36, rightH: 14 },
      // frame 3: both mid (passing back)
      { leftY: 39, leftH: 11, rightY: 39, rightH: 11 },
    ];

    for (let frame = 0; frame < 4; frame++) {
      const g = this.add.graphics();
      const cx = w / 2;
      this.drawHoodieBody(g, cx, topPad);

      const leftX = cx - 6;
      const rightX = cx + 1;
      const legW = 7;
      const shoeH = 3;
      const cfg = legConfigs[frame];

      this.drawLeg(g, leftX, topPad + cfg.leftY, legW, cfg.leftH, shoeH, legR);
      this.drawLeg(g, rightX, topPad + cfg.rightY, legW, cfg.rightH, shoeH, legR);
      this.drawShadow(g, cx, topPad + Math.max(cfg.leftY + cfg.leftH, cfg.rightY + cfg.rightH));

      g.generateTexture(`player_run${frame}`, w, h);
      g.destroy();
    }

    // --- Jump frame (>< eyes, "open" face on first jump) ---
    {
      const g = this.add.graphics();
      const cx = w / 2;
      this.drawHoodieBody(g, cx, topPad, "squint");

      const leftX = cx - 6;
      const rightX = cx + 1;
      const legW = 7;
      const shoeH = 3;
      this.drawLeg(g, leftX, topPad + 38, legW, 12, shoeH, legR);
      this.drawLeg(g, rightX, topPad + 40, legW, 10, shoeH, legR);

      g.generateTexture("player_jump", w, h);
      g.destroy();
    }

    // --- Fall frame (legs spread, "open" mouth) ---
    {
      const g = this.add.graphics();
      const cx = w / 2;
      this.drawHoodieBody(g, cx, topPad, "open");

      const leftX = cx - 8;
      const rightX = cx + 3;
      const legW = 7;
      const shoeH = 3;
      this.drawLeg(g, leftX, topPad + 38, legW, 13, shoeH, legR);
      this.drawLeg(g, rightX, topPad + 38, legW, 13, shoeH, legR);

      g.generateTexture("player_fall", w, h);
      g.destroy();
    }

    // --- Spin frame (tucked short legs) ---
    {
      const g = this.add.graphics();
      const cx = w / 2;
      this.drawHoodieBody(g, cx, topPad, "squint");

      const leftX = cx - 6;
      const rightX = cx + 1;
      const legW = 7;
      const shoeH = 2;
      const tuckY = topPad + 39;
      const tuckH = 7;

      this.drawLeg(g, leftX, tuckY, legW, tuckH, shoeH, legR);
      this.drawLeg(g, rightX, tuckY, legW, tuckH, shoeH, legR);

      g.generateTexture("player_spin", w, h);
      g.destroy();
    }

    // --- Duck frame (uses drawHoodieBody for consistent look, shifted down) ---
    {
      const g = this.add.graphics();
      const cx = w / 2;
      const duckTopPad = topPad + 12; // shift body down to look squished
      this.drawHoodieBody(g, cx, duckTopPad, "squint");

      // Short tucked legs
      const leftX = cx - 6;
      const rightX = cx + 1;
      const legW = 7;
      const shoeH = 2;
      this.drawLeg(g, leftX, duckTopPad + 38, legW, 6, shoeH, 3);
      this.drawLeg(g, rightX, duckTopPad + 38, legW, 6, shoeH, 3);
      this.drawShadow(g, cx, duckTopPad + 44);

      g.generateTexture("player_duck", w, h);
      g.destroy();
    }

    // --- Dead frame (x x eyes) ---
    {
      const g = this.add.graphics();
      const cx = w / 2;
      this.drawHoodieBody(g, cx, topPad, "dead");

      const leftX = cx - 6;
      const rightX = cx + 1;
      const legW = 7;
      const shoeH = 3;
      this.drawLeg(g, leftX, topPad + 38, legW, 12, shoeH, legR);
      this.drawLeg(g, rightX, topPad + 40, legW, 10, shoeH, legR);

      g.generateTexture("player_dead", w, h);
      g.destroy();
    }
  }

  private createGroundTileTexture(): void {
    const w = GROUND_TILE_WIDTH;
    const h = GROUND_HEIGHT;

    // Create two tile variants
    for (let variant = 0; variant < 2; variant++) {
      const g = this.add.graphics();
      const seed = variant * 137;

      // Gradient fill (starts right below grass strip)
      const topRGB = { r: 0x9b, g: 0x83, b: 0x65 };
      const botRGB = { r: 0x6a, g: 0x55, b: 0x40 };
      const gradientStart = 6;
      const gradientRows = h - gradientStart;
      for (let i = 0; i < gradientRows; i++) {
        const t = i / (gradientRows - 1);
        const r = Math.round(topRGB.r + (botRGB.r - topRGB.r) * t);
        const gr = Math.round(topRGB.g + (botRGB.g - topRGB.g) * t);
        const b = Math.round(topRGB.b + (botRGB.b - topRGB.b) * t);
        g.fillStyle((r << 16) | (gr << 8) | b);
        g.fillRect(0, gradientStart + i, w, 1);
      }

      // Dirt texture dots
      for (let d = 0; d < 30; d++) {
        const dx = ((seed + d * 73) % w);
        const dy = gradientStart + ((seed + d * 47) % gradientRows);
        g.fillStyle(0x5a4530, 0.3);
        g.fillRect(dx, dy, 1, 1);
      }

      // Grass top
      g.fillStyle(COLOR_GROUND_TOP);
      g.fillRect(0, 0, w, 6);

      // Grass blades
      const bladeColors = [0x6b8e23, 0x7ba028, 0x5d7a1e];
      for (let bx = 0; bx < w; bx += Phaser.Math.Between(3, 5)) {
        const bladeH = Phaser.Math.Between(3, 6);
        const color = bladeColors[(bx + seed) % bladeColors.length];
        g.fillStyle(color);
        g.fillTriangle(bx, 6, bx + 1, 6 - bladeH, bx + 2, 6);
      }

      // Top border line
      g.lineStyle(1, 0x4a6818);
      g.lineBetween(0, 6, w, 6);

      // Tile divider
      g.lineStyle(1, 0x7a6548);
      g.lineBetween(w - 1, 6, w - 1, h);

      const key = variant === 0 ? "groundTile" : "groundTile2";
      g.generateTexture(key, w, h);
      g.destroy();
    }
  }

  private createCoinTexture(): void {
    const size = COIN_SIZE;

    // Main coin + 3 spin frames (width variation)
    const widths = [1.0, 0.7, 0.3, 0.7];
    for (let frame = 0; frame < 4; frame++) {
      const g = this.add.graphics();
      const scaleX = widths[frame];
      const cx = size / 2;
      const cy = size / 2;
      const rx = (size / 2 - 1) * scaleX;
      const ry = size / 2 - 1;

      // Outer
      g.fillStyle(COLOR_COIN);
      g.fillEllipse(cx, cy, rx * 2, ry * 2);

      // Inner ring
      g.fillStyle(0xd4a017, 0.4);
      g.fillEllipse(cx, cy, rx * 1.4, ry * 1.4);

      // Star in center (only if wide enough)
      if (scaleX > 0.5) {
        g.fillStyle(0xfff176, 0.8);
        const starR = ry * 0.35;
        g.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
          const innerAngle = angle + Math.PI / 5;
          const ox = cx + Math.cos(angle) * starR * scaleX;
          const oy = cy + Math.sin(angle) * starR;
          const ix = cx + Math.cos(innerAngle) * starR * 0.4 * scaleX;
          const iy = cy + Math.sin(innerAngle) * starR * 0.4;
          if (i === 0) g.moveTo(ox, oy);
          else g.lineTo(ox, oy);
          g.lineTo(ix, iy);
        }
        g.closePath();
        g.fillPath();
      }

      // Border
      g.lineStyle(1.5, 0xd4a017);
      g.strokeEllipse(cx, cy, rx * 2, ry * 2);

      // Highlight
      if (scaleX > 0.4) {
        g.fillStyle(0xfff176, 0.5);
        g.fillEllipse(cx - rx * 0.2, cy - ry * 0.2, rx * 0.5, ry * 0.5);
      }

      // Shadow arc
      g.lineStyle(1, 0xb8860b, 0.3);
      g.beginPath();
      g.arc(cx + rx * 0.1, cy + ry * 0.1, ry * 0.7, 0.3, Math.PI * 0.8, false);
      g.strokePath();

      g.generateTexture(`coin_f${frame}`, size, size);
      g.destroy();
    }

    // Coin glow texture
    {
      const glowSize = 30;
      const g = this.add.graphics();
      for (let ring = 5; ring > 0; ring--) {
        const t = ring / 5;
        g.fillStyle(0xf1c40f, t * 0.15);
        g.fillCircle(glowSize / 2, glowSize / 2, (glowSize / 2) * t);
      }
      g.generateTexture("coinGlow", glowSize, glowSize);
      g.destroy();
    }
  }

  // ── Mountain textures (3 layers) ──

  private createMountainTextures(): void {
    const w = 800;
    const h = 160;

    // Far mountains
    {
      const g = this.add.graphics();
      g.fillStyle(COLOR_MOUNTAIN_FAR);
      g.beginPath();
      g.moveTo(0, h);
      g.lineTo(0, 90);
      g.lineTo(60, 40);
      g.lineTo(120, 70);
      g.lineTo(180, 20);
      g.lineTo(250, 60);
      g.lineTo(320, 35);
      g.lineTo(400, 55);
      g.lineTo(460, 15);
      g.lineTo(530, 50);
      g.lineTo(580, 30);
      g.lineTo(650, 65);
      g.lineTo(720, 25);
      g.lineTo(770, 55);
      g.lineTo(800, 45);
      g.lineTo(800, h);
      g.closePath();
      g.fillPath();
      g.generateTexture("mountains_far", w, h);
      g.destroy();
    }

    // Mid mountains
    {
      const g = this.add.graphics();
      g.fillStyle(COLOR_MOUNTAIN_MID);
      g.beginPath();
      g.moveTo(0, h);
      g.lineTo(0, 80);
      g.lineTo(80, 35);
      g.lineTo(150, 65);
      g.lineTo(220, 25);
      g.lineTo(300, 55);
      g.lineTo(380, 20);
      g.lineTo(450, 50);
      g.lineTo(520, 30);
      g.lineTo(600, 60);
      g.lineTo(680, 28);
      g.lineTo(750, 50);
      g.lineTo(800, 40);
      g.lineTo(800, h);
      g.closePath();
      g.fillPath();
      g.generateTexture("mountains_mid", w, h);
      g.destroy();
    }

    // Near mountains
    {
      const g = this.add.graphics();
      g.fillStyle(COLOR_MOUNTAIN_NEAR);
      g.beginPath();
      g.moveTo(0, h);
      g.lineTo(0, 70);
      g.lineTo(100, 30);
      g.lineTo(200, 60);
      g.lineTo(280, 15);
      g.lineTo(360, 50);
      g.lineTo(440, 25);
      g.lineTo(540, 55);
      g.lineTo(620, 20);
      g.lineTo(700, 45);
      g.lineTo(780, 30);
      g.lineTo(800, 50);
      g.lineTo(800, h);
      g.closePath();
      g.fillPath();
      g.generateTexture("mountains_near", w, h);
      g.destroy();
    }
  }

  private createMeteorTexture(): void {
    const size = QUIZ_ITEM_SIZE;
    const g = this.add.graphics();

    g.fillStyle(0xff6b35, 0.3);
    g.fillCircle(size / 2, size / 2, size / 2);

    g.fillStyle(0xffaa00);
    g.fillCircle(size / 2, size / 2, size / 3);

    g.fillStyle(0xffff99);
    g.fillCircle(size / 2, size / 2, size / 5);

    g.generateTexture("meteor", size, size);
    g.destroy();
  }
}
