import Phaser from "phaser";
import { QUIZ_WORD_WIDTH, QUIZ_WORD_HEIGHT } from "../constants";

export class QuizItem extends Phaser.Physics.Arcade.Sprite {
  readonly keyword: string;
  readonly isCorrect: boolean;
  private label: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    keyword: string,
    isCorrect: boolean
  ) {
    super(scene, x, y, "quizWord");

    this.keyword = keyword;
    this.isCorrect = isCorrect;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Let body auto-scale via displaySize — no manual setSize
    this.setDisplaySize(QUIZ_WORD_WIDTH, QUIZ_WORD_HEIGHT);

    this.label = scene.add
      .text(x, y, keyword, {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
  }

  setScrollSpeed(speed: number): void {
    this.setVelocityX(speed);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    this.label.setPosition(this.x, this.y);

    if (this.x + QUIZ_WORD_WIDTH / 2 < 0) {
      this.destroyWithLabel();
    }
  }

  destroyWithLabel(): void {
    this.label.destroy();
    this.destroy();
  }
}
