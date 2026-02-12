import Phaser from "phaser";
import {
  PLAYER_SIZE,
  GROUND_TILE_WIDTH,
  GROUND_HEIGHT,
  COIN_SIZE,
  QUIZ_ITEM_SIZE,
  COLOR_GROUND,
  COLOR_GROUND_TOP,
  COLOR_COIN,
} from "../constants";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create(): void {
    this.createPlayerTexture();
    this.createGroundTileTexture();
    this.createCoinTexture();
    this.createMeteorTexture();
    this.scene.start("GameScene");
  }

  private createPlayerTexture(): void {
    const size = PLAYER_SIZE;
    const g = this.add.graphics();
    const cx = size / 2;

    // Guitar-pick (rounded triangle) body
    const topCy = size * 0.28;
    const topR = size * 0.46;
    const botY = size - 2;
    const dist = botY - topCy;
    const halfAngle = Math.acos(topR / dist);

    g.fillStyle(0xc0392b);
    g.beginPath();
    g.arc(cx, topCy, topR, Math.PI / 2 - halfAngle, Math.PI / 2 + halfAngle, true);
    g.lineTo(cx, botY);
    g.closePath();
    g.fillPath();

    // Darker outline
    g.lineStyle(2, 0x922b21);
    g.beginPath();
    g.arc(cx, topCy, topR, Math.PI / 2 - halfAngle, Math.PI / 2 + halfAngle, true);
    g.lineTo(cx, botY);
    g.closePath();
    g.strokePath();

    // White round face
    const faceCx = cx + size * 0.1;
    const faceCy = topCy + 1;
    const faceR = size * 0.3;
    g.fillStyle(0xffffff);
    g.fillCircle(faceCx, faceCy, faceR);

    // Eyes (original style)
    g.fillStyle(0xffffff);
    g.fillCircle(size * 0.55, size * 0.27, 6);
    g.fillCircle(size * 0.75, size * 0.27, 5);

    g.fillStyle(0x222222);
    g.fillCircle(size * 0.58, size * 0.27, 3);
    g.fillCircle(size * 0.77, size * 0.27, 2.5);

    // Blush marks
    g.fillStyle(0xffaaaa, 0.5);
    g.fillCircle(faceCx - faceR * 0.55, faceCy + faceR * 0.45, 3);
    g.fillCircle(faceCx + faceR * 0.6, faceCy + faceR * 0.45, 3);

    g.generateTexture("player", size, size);
    g.destroy();
  }

  private createGroundTileTexture(): void {
    const w = GROUND_TILE_WIDTH;
    const h = GROUND_HEIGHT;
    const g = this.add.graphics();

    g.fillStyle(COLOR_GROUND);
    g.fillRect(0, 0, w, h);

    g.fillStyle(COLOR_GROUND_TOP);
    g.fillRect(0, 0, w, 6);

    // Subtle tile divider line
    g.lineStyle(1, 0x7a6548);
    g.lineBetween(w - 1, 6, w - 1, h);

    g.generateTexture("groundTile", w, h);
    g.destroy();
  }

  private createCoinTexture(): void {
    const size = COIN_SIZE;
    const g = this.add.graphics();

    // Outer circle
    g.fillStyle(COLOR_COIN);
    g.fillCircle(size / 2, size / 2, size / 2);

    // Border
    g.lineStyle(2, 0xd4a017);
    g.strokeCircle(size / 2, size / 2, size / 2 - 1);

    // Highlight
    g.fillStyle(0xfff176);
    g.fillCircle(size / 2 - 2, size / 2 - 2, size / 4);

    g.generateTexture("coin", size, size);
    g.destroy();
  }

  private createMeteorTexture(): void {
    const size = QUIZ_ITEM_SIZE;
    const g = this.add.graphics();

    // Outer glow
    g.fillStyle(0xff6b35, 0.3);
    g.fillCircle(size / 2, size / 2, size / 2);

    // Core
    g.fillStyle(0xffaa00);
    g.fillCircle(size / 2, size / 2, size / 3);

    // Center highlight
    g.fillStyle(0xffff99);
    g.fillCircle(size / 2, size / 2, size / 5);

    g.generateTexture("meteor", size, size);
    g.destroy();
  }
}
