import Phaser from "phaser";
import {
  PLAYER_SIZE,
  GROUND_TILE_WIDTH,
  GROUND_HEIGHT,
  COIN_SIZE,
  QUIZ_WORD_WIDTH,
  QUIZ_WORD_HEIGHT,
  COLOR_PLAYER,
  COLOR_GROUND,
  COLOR_GROUND_TOP,
  COLOR_COIN,
  COLOR_QUIZ_WORD,
} from "../constants";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create(): void {
    this.createPlayerTexture();
    this.createGroundTileTexture();
    this.createCoinTexture();
    this.createQuizWordTexture();
    this.scene.start("GameScene");
  }

  private createPlayerTexture(): void {
    const size = PLAYER_SIZE;
    const g = this.add.graphics();

    g.fillStyle(COLOR_PLAYER);
    g.fillRoundedRect(0, 0, size, size, 8);

    g.fillStyle(0xffffff);
    g.fillCircle(size * 0.65, size * 0.3, 6);
    g.fillCircle(size * 0.85, size * 0.3, 5);

    g.fillStyle(0x222222);
    g.fillCircle(size * 0.68, size * 0.3, 3);
    g.fillCircle(size * 0.87, size * 0.3, 2.5);

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

  private createQuizWordTexture(): void {
    const w = QUIZ_WORD_WIDTH;
    const h = QUIZ_WORD_HEIGHT;
    const g = this.add.graphics();

    g.fillStyle(COLOR_QUIZ_WORD);
    g.fillRoundedRect(0, 0, w, h, 8);

    g.lineStyle(2, 0x2980b9);
    g.strokeRoundedRect(1, 1, w - 2, h - 2, 8);

    g.generateTexture("quizWord", w, h);
    g.destroy();
  }
}
