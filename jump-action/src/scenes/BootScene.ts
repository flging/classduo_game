import Phaser from "phaser";
import {
  PLAYER_SIZE,
  PLAYER_TEX_HEIGHT,
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
    const w = PLAYER_SIZE;
    const h = PLAYER_TEX_HEIGHT;

    // Generate two run frames with alternating leg positions
    for (let frame = 0; frame < 2; frame++) {
      const g = this.add.graphics();
      const cx = w / 2;

      // --- Hoodie body (rounded rect with large top corners, small bottom) ---
      const bodyX = 4;
      const bodyW = 32;
      const bodyH = 38;
      const tlr = 14; // top-left radius
      const trr = 14; // top-right radius
      const blr = 4;  // bottom-left radius
      const brr = 4;  // bottom-right radius

      g.fillStyle(0xc0392b);
      g.beginPath();
      g.moveTo(bodyX + tlr, 0);
      g.lineTo(bodyX + bodyW - trr, 0);
      g.arc(bodyX + bodyW - trr, trr, trr, -Math.PI / 2, 0, false);
      g.lineTo(bodyX + bodyW, bodyH - brr);
      g.arc(bodyX + bodyW - brr, bodyH - brr, brr, 0, Math.PI / 2, false);
      g.lineTo(bodyX + blr, bodyH);
      g.arc(bodyX + blr, bodyH - blr, blr, Math.PI / 2, Math.PI, false);
      g.lineTo(bodyX, tlr);
      g.arc(bodyX + tlr, tlr, tlr, Math.PI, -Math.PI / 2, false);
      g.closePath();
      g.fillPath();

      // Darker outline
      g.lineStyle(2, 0x922b21);
      g.beginPath();
      g.moveTo(bodyX + tlr, 0);
      g.lineTo(bodyX + bodyW - trr, 0);
      g.arc(bodyX + bodyW - trr, trr, trr, -Math.PI / 2, 0, false);
      g.lineTo(bodyX + bodyW, bodyH - brr);
      g.arc(bodyX + bodyW - brr, bodyH - brr, brr, 0, Math.PI / 2, false);
      g.lineTo(bodyX + blr, bodyH);
      g.arc(bodyX + blr, bodyH - blr, blr, Math.PI / 2, Math.PI, false);
      g.lineTo(bodyX, tlr);
      g.arc(bodyX + tlr, tlr, tlr, Math.PI, -Math.PI / 2, false);
      g.closePath();
      g.strokePath();

      // --- Hood opening / face area (white oval inside hood) ---
      const faceCx = cx + 2;
      const faceCy = 14;
      const faceRx = 11;
      const faceRy = 10;
      g.fillStyle(0xffffff);
      g.fillEllipse(faceCx, faceCy, faceRx * 2, faceRy * 2);

      // --- Eyes ---
      g.fillStyle(0xffffff);
      g.fillCircle(cx + 2, 13, 5);
      g.fillCircle(cx + 10, 13, 4);

      g.fillStyle(0x222222);
      g.fillCircle(cx + 4, 13, 2.5);
      g.fillCircle(cx + 11, 13, 2);

      // --- Blush marks ---
      g.fillStyle(0xffaaaa, 0.5);
      g.fillCircle(faceCx - faceRx * 0.6, faceCy + faceRy * 0.5, 2.5);
      g.fillCircle(faceCx + faceRx * 0.65, faceCy + faceRy * 0.5, 2.5);

      // --- Legs (alternating per frame) ---
      // Left leg
      const leftX = cx - 6;
      const leftW = 7;
      const leftY = frame === 0 ? 38 : 40;
      const leftH = frame === 0 ? 12 : 10;
      const leftShoeH = 3;

      g.fillStyle(0xc0392b);
      g.fillRect(leftX, leftY, leftW, leftH - leftShoeH);
      g.fillStyle(0x922b21);
      g.fillRect(leftX, leftY + leftH - leftShoeH, leftW, leftShoeH);

      // Right leg
      const rightX = cx + 1;
      const rightW = 7;
      const rightY = frame === 0 ? 40 : 38;
      const rightH = frame === 0 ? 10 : 12;
      const rightShoeH = 3;

      g.fillStyle(0xc0392b);
      g.fillRect(rightX, rightY, rightW, rightH - rightShoeH);
      g.fillStyle(0x922b21);
      g.fillRect(rightX, rightY + rightH - rightShoeH, rightW, rightShoeH);

      g.generateTexture(`player_run${frame}`, w, h);
      g.destroy();
    }
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
