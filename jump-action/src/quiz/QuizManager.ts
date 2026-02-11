import Phaser from "phaser";
import { QuizItem } from "../entities/QuizItem";
import { ChoiceType } from "./quizTypes";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GROUND_Y,
  GROUND_HEIGHT,
  QUIZ_ANNOUNCE_MS,
  QUIZ_WINDOW_MS,
  QUIZ_RESULT_MS,
  QUIZ_ITEM_HIGH_Y,
  QUIZ_ITEM_SPACING_X,
  SCORE_BONUS,
} from "../constants";

export type GameState =
  | "playing"
  | "quiz_announce"
  | "quiz_active"
  | "quiz_result"
  | "game_over";

export interface QuizCallbacks {
  getScrollSpeed: () => number;
  applySpeedUp: () => void;
  applyJumpUp: () => void;
  setGameState: (state: GameState) => void;
  addScore: (amount: number) => void;
}

interface ChoiceOption {
  label: string;
  type: ChoiceType;
}

const CHOICES: ChoiceOption[] = [
  { label: "점프 UP", type: "jump" },
  { label: "속도 UP", type: "speed" },
  { label: "+30점", type: "score" },
];

export class QuizManager {
  private scene: Phaser.Scene;
  private callbacks: QuizCallbacks;
  private quizItems: Phaser.Physics.Arcade.Group;
  private bannerText: Phaser.GameObjects.Text | null = null;
  private resultText: Phaser.GameObjects.Text | null = null;
  private timeoutTimer: Phaser.Time.TimerEvent | null = null;

  constructor(
    scene: Phaser.Scene,
    quizItems: Phaser.Physics.Arcade.Group,
    callbacks: QuizCallbacks
  ) {
    this.scene = scene;
    this.quizItems = quizItems;
    this.callbacks = callbacks;
  }

  startQuiz(): void {
    this.callbacks.setGameState("quiz_announce");

    this.bannerText = this.scene.add
      .text(GAME_WIDTH / 2, 50, "보상을 선택하세요!", {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#ffffff",
        backgroundColor: "#2c3e50",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.scene.time.delayedCall(QUIZ_ANNOUNCE_MS, () => {
      this.callbacks.setGameState("quiz_active");
      this.spawnChoiceItems();

      this.timeoutTimer = this.scene.time.delayedCall(QUIZ_WINDOW_MS, () => {
        this.handleTimeout();
      });
    });
  }

  handleCollection(item: QuizItem): void {
    if (this.timeoutTimer) {
      this.timeoutTimer.remove();
      this.timeoutTimer = null;
    }

    this.clearQuizItems();

    switch (item.choiceType) {
      case "speed":
        this.callbacks.applySpeedUp();
        this.showResult("SPEED UP!", "#3498db");
        break;
      case "jump":
        this.callbacks.applyJumpUp();
        this.showResult("JUMP UP!", "#2ecc71");
        break;
      case "score":
        this.callbacks.addScore(SCORE_BONUS);
        this.showResult(`+${SCORE_BONUS}점!`, "#f1c40f");
        break;
    }
  }

  cleanup(): void {
    this.clearQuizItems();
    this.clearBanner();
    this.clearResult();
    if (this.timeoutTimer) {
      this.timeoutTimer.remove();
      this.timeoutTimer = null;
    }
  }

  private spawnChoiceItems(): void {
    const speed = this.callbacks.getScrollSpeed();
    const startX = GAME_WIDTH + 50;
    const groundTop = GROUND_Y - GROUND_HEIGHT / 2;
    const lowY = groundTop - 25;

    const shuffled = Phaser.Utils.Array.Shuffle([...CHOICES]);

    shuffled.forEach((choice, i) => {
      const isHigh = i % 2 === 0;
      const y = isHigh ? QUIZ_ITEM_HIGH_Y : lowY;
      const x = startX + i * QUIZ_ITEM_SPACING_X;

      const item = new QuizItem(this.scene, x, y, choice.label, choice.type);
      this.quizItems.add(item);
      item.setScrollSpeed(speed);
    });
  }

  private handleTimeout(): void {
    this.clearQuizItems();
    this.showResult("시간 초과!", "#e67e22");
  }

  private showResult(text: string, color: string): void {
    this.clearBanner();

    this.callbacks.setGameState("quiz_result");

    this.resultText = this.scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, text, {
        fontFamily: "monospace",
        fontSize: "36px",
        color: color,
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.scene.time.delayedCall(QUIZ_RESULT_MS, () => {
      this.clearResult();
      this.callbacks.setGameState("playing");
    });
  }

  private clearQuizItems(): void {
    this.quizItems.getChildren().forEach((obj) => {
      const item = obj as QuizItem;
      item.destroyWithLabel();
    });
    this.quizItems.clear(true);
  }

  private clearBanner(): void {
    if (this.bannerText) {
      this.bannerText.destroy();
      this.bannerText = null;
    }
  }

  private clearResult(): void {
    if (this.resultText) {
      this.resultText.destroy();
      this.resultText = null;
    }
  }
}
