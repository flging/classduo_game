import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, RESTART_DELAY } from "../constants";

export class GameOverScene extends Phaser.Scene {
  private score = 0;

  constructor() {
    super({ key: "GameOverScene" });
  }

  init(data: { score: number }): void {
    this.score = data.score ?? 0;
  }

  create(): void {
    // Semi-transparent overlay
    this.add
      .rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        0x000000,
        0.6
      )
      .setOrigin(0.5);

    // GAME OVER text
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.35, "GAME OVER", {
        fontFamily: "monospace",
        fontSize: "48px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Score
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.52, `Score: ${this.score}`, {
        fontFamily: "monospace",
        fontSize: "28px",
        color: "#f0c040",
      })
      .setOrigin(0.5);

    // Blinking restart text
    const restartText = this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT * 0.7,
        "Press SPACE or Click to Restart",
        {
          fontFamily: "monospace",
          fontSize: "18px",
          color: "#cccccc",
        }
      )
      .setOrigin(0.5)
      .setAlpha(0);

    // Delay before allowing restart (prevent accidental immediate restart)
    this.time.delayedCall(RESTART_DELAY, () => {
      // Fade in and blink
      this.tweens.add({
        targets: restartText,
        alpha: { from: 0, to: 1 },
        duration: 400,
        yoyo: true,
        repeat: -1,
        hold: 600,
      });

      // Enable restart input
      this.input.keyboard?.on("keydown-SPACE", this.restart, this);
      this.input.keyboard?.on("keydown-UP", this.restart, this);
      this.input.on("pointerdown", this.restart, this);
    });
  }

  private restart(): void {
    this.scene.start("GameScene");
  }
}
