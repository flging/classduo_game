import Phaser from "phaser";
import { QuizItem } from "../entities/QuizItem";
import { QuizQuestion, BuffType } from "./quizTypes";
import { QUIZ_QUESTIONS } from "./quizData";
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
} from "../constants";

export type GameState =
  | "playing"
  | "quiz_announce"
  | "quiz_active"
  | "quiz_result"
  | "game_over";

export interface QuizCallbacks {
  getScrollSpeed: () => number;
  applyBuff: () => void;
  applyDebuff: () => void;
  setGameState: (state: GameState) => void;
  addScore: (amount: number) => void;
}

export class QuizManager {
  private scene: Phaser.Scene;
  private callbacks: QuizCallbacks;
  private quizItems: Phaser.Physics.Arcade.Group;
  private bannerText: Phaser.GameObjects.Text | null = null;
  private resultText: Phaser.GameObjects.Text | null = null;
  private usedQuestions: Set<number> = new Set();
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
    const question = this.pickQuestion();
    if (!question) return;

    this.callbacks.setGameState("quiz_announce");

    // Show banner
    this.bannerText = this.scene.add
      .text(GAME_WIDTH / 2, 50, `먹으세요: ${question.correctAnswer}`, {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#ffffff",
        backgroundColor: "#2c3e50",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(10);

    // After announce delay, spawn items
    this.scene.time.delayedCall(QUIZ_ANNOUNCE_MS, () => {
      this.callbacks.setGameState("quiz_active");
      this.spawnQuizItems(question);

      // Timeout timer
      this.timeoutTimer = this.scene.time.delayedCall(QUIZ_WINDOW_MS, () => {
        this.handleTimeout();
      });
    });
  }

  handleCollection(item: QuizItem): void {
    // Cancel timeout
    if (this.timeoutTimer) {
      this.timeoutTimer.remove();
      this.timeoutTimer = null;
    }

    // Remove all quiz items
    this.clearQuizItems();

    if (item.isCorrect) {
      this.callbacks.applyBuff();
      this.showResult("정답!", "#2ecc71");
    } else {
      this.callbacks.applyDebuff();
      this.showResult("오답!", "#e74c3c");
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

  private pickQuestion(): QuizQuestion | null {
    // Reset pool if all used
    if (this.usedQuestions.size >= QUIZ_QUESTIONS.length) {
      this.usedQuestions.clear();
    }

    const available = QUIZ_QUESTIONS.filter(
      (_, i) => !this.usedQuestions.has(i)
    );
    const idx = Phaser.Math.Between(0, available.length - 1);
    const originalIdx = QUIZ_QUESTIONS.indexOf(available[idx]);
    this.usedQuestions.add(originalIdx);

    return available[idx];
  }

  private spawnQuizItems(question: QuizQuestion): void {
    const allWords = [question.correctAnswer, ...question.wrongAnswers];
    Phaser.Utils.Array.Shuffle(allWords);

    const speed = this.callbacks.getScrollSpeed();
    const startX = GAME_WIDTH + 50;
    const groundTop = GROUND_Y - GROUND_HEIGHT / 2;
    const lowY = groundTop - 25;

    allWords.forEach((word, i) => {
      const isHigh = i % 2 === 0;
      const y = isHigh ? QUIZ_ITEM_HIGH_Y : lowY;
      const x = startX + i * QUIZ_ITEM_SPACING_X;
      const isCorrect = word === question.correctAnswer;

      const item = new QuizItem(this.scene, x, y, word, isCorrect);
      this.quizItems.add(item);
      item.setScrollSpeed(speed);
    });
  }

  private handleTimeout(): void {
    this.clearQuizItems();
    this.callbacks.addScore(-3);
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
