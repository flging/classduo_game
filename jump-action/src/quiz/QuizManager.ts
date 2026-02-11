import Phaser from "phaser";
import { QuizItem } from "../entities/QuizItem";
import { QuizQuestion, ChoiceType } from "./quizTypes";
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
  SCORE_BONUS,
} from "../constants";

export type GameState =
  | "playing"
  | "quiz_announce"
  | "quiz_active"
  | "quiz_result"
  | "choosing_reward"
  | "game_over";

export interface QuizCallbacks {
  getScrollSpeed: () => number;
  applySpeedUp: () => void;
  applySpeedDown: () => void;
  applyJumpUp: () => void;
  applyJumpDown: () => void;
  applyJumpCountUp: () => void;
  applyJumpCountDown: () => void;
  setGameState: (state: GameState) => void;
  addScore: (amount: number) => void;
  showEffect: (text: string, color: string) => void;
}

interface CardDef {
  type: ChoiceType;
  title: string;
  desc: string;
  color: number;
}

const REWARD_CARDS: CardDef[] = [
  { type: "jump", title: "점프력 UP", desc: "점프력 15% 증가", color: 0x2ecc71 },
  { type: "jumpCount", title: "점프횟수 UP", desc: "점프 횟수 +1", color: 0x9b59b6 },
  { type: "speed", title: "속도 UP", desc: "이동속도 15% 증가", color: 0x3498db },
  { type: "score", title: `+${SCORE_BONUS}점`, desc: "즉시 점수 획득", color: 0xf1c40f },
];

export class QuizManager {
  private scene: Phaser.Scene;
  private callbacks: QuizCallbacks;
  private quizItems: Phaser.Physics.Arcade.Group;
  private bannerText: Phaser.GameObjects.Text | null = null;
  private resultText: Phaser.GameObjects.Text | null = null;
  private usedQuestions: Set<number> = new Set();
  private timeoutTimer: Phaser.Time.TimerEvent | null = null;
  private rewardUI: Phaser.GameObjects.GameObject[] = [];

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

    this.scene.time.delayedCall(QUIZ_ANNOUNCE_MS, () => {
      this.callbacks.setGameState("quiz_active");
      this.spawnQuizItems(question);

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
    this.clearBanner();
    this.showRewardCards(item.isCorrect);
  }

  cleanup(): void {
    this.clearQuizItems();
    this.clearBanner();
    this.clearResult();
    this.clearRewardUI();
    if (this.timeoutTimer) {
      this.timeoutTimer.remove();
      this.timeoutTimer = null;
    }
    if (this.scene.physics.world.isPaused) {
      this.scene.physics.resume();
    }
  }

  // ---- Quiz question ----

  private pickQuestion(): QuizQuestion | null {
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
    this.showResult("시간 초과!", "#e67e22");
  }

  // ---- Result display ----

  private showResult(
    text: string,
    color: string,
    onComplete?: () => void
  ): void {
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
      if (onComplete) {
        onComplete();
      } else {
        this.callbacks.setGameState("playing");
      }
    });
  }

  // ---- Reward card UI ----

  private showRewardCards(isCorrect: boolean): void {
    this.callbacks.setGameState("choosing_reward");
    this.scene.physics.pause();

    const cardCount = REWARD_CARDS.length;
    const cardW = 140;
    const cardH = 180;
    const gap = 16;
    const totalW = cardW * cardCount + gap * (cardCount - 1);
    const startX = (GAME_WIDTH - totalW) / 2;
    const cardY = (GAME_HEIGHT - cardH) / 2;

    // Dark overlay
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.setDepth(20);
    this.rewardUI.push(overlay);

    // Title
    const title = this.scene.add
      .text(GAME_WIDTH / 2, cardY - 30, "보상을 선택하세요!", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(21);
    this.rewardUI.push(title);

    // Cards
    REWARD_CARDS.forEach((card, i) => {
      const cx = startX + cardW / 2 + i * (cardW + gap);
      const cy = cardY + cardH / 2;

      const container = this.scene.add.container(cx, cy).setDepth(21);

      // Background
      const bg = this.scene.add.graphics();
      bg.fillStyle(card.color, 1);
      bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
      bg.fillStyle(0x000000, 0.15);
      bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
      container.add(bg);

      // Title
      const cardTitle = this.scene.add
        .text(0, -25, card.title, {
          fontFamily: "monospace",
          fontSize: "18px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      container.add(cardTitle);

      // Description
      const cardDesc = this.scene.add
        .text(0, 20, card.desc, {
          fontFamily: "monospace",
          fontSize: "12px",
          color: "#ffffffcc",
        })
        .setOrigin(0.5);
      container.add(cardDesc);

      container.setSize(cardW, cardH);
      container.setInteractive({ useHandCursor: true });

      container.on("pointerover", () => {
        this.scene.tweens.add({
          targets: container,
          scaleX: 1.08,
          scaleY: 1.08,
          duration: 100,
        });
      });
      container.on("pointerout", () => {
        this.scene.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
        });
      });
      container.on("pointerdown", () =>
        this.selectReward(card.type, isCorrect)
      );

      this.rewardUI.push(container);
    });
  }

  private selectReward(type: ChoiceType, isCorrect: boolean): void {
    this.clearRewardUI();
    this.scene.physics.resume();

    const prefix = isCorrect ? "정답! " : "오답! ";
    const color = isCorrect ? "#2ecc71" : "#e74c3c";

    switch (type) {
      case "speed":
        if (isCorrect) {
          this.callbacks.applySpeedUp();
          this.callbacks.showEffect(prefix + "SPEED UP!", color);
        } else {
          this.callbacks.applySpeedDown();
          this.callbacks.showEffect(prefix + "SPEED DOWN!", color);
        }
        break;
      case "jump":
        if (isCorrect) {
          this.callbacks.applyJumpUp();
          this.callbacks.showEffect(prefix + "JUMP UP!", color);
        } else {
          this.callbacks.applyJumpDown();
          this.callbacks.showEffect(prefix + "JUMP DOWN!", color);
        }
        break;
      case "jumpCount":
        if (isCorrect) {
          this.callbacks.applyJumpCountUp();
          this.callbacks.showEffect(prefix + "JUMP COUNT UP!", color);
        } else {
          this.callbacks.applyJumpCountDown();
          this.callbacks.showEffect(prefix + "JUMP COUNT DOWN!", color);
        }
        break;
      case "score": {
        const amount = isCorrect ? SCORE_BONUS : -SCORE_BONUS;
        this.callbacks.addScore(amount);
        const label = amount > 0 ? `+${amount}점!` : `${amount}점!`;
        this.callbacks.showEffect(prefix + label, color);
        break;
      }
    }

    this.callbacks.setGameState("playing");
  }

  // ---- Cleanup helpers ----

  private clearRewardUI(): void {
    this.rewardUI.forEach((obj) => obj.destroy());
    this.rewardUI = [];
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
