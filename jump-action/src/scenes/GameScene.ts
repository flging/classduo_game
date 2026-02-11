import Phaser from "phaser";
import { Player } from "../entities/Player";
import { GroundSegment } from "../entities/GroundSegment";
import { Coin } from "../entities/Coin";
import { QuizItem } from "../entities/QuizItem";
import { QuizManager, GameState } from "../quiz/QuizManager";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_X,
  PLAYER_SIZE,
  GROUND_Y,
  GROUND_HEIGHT,
  GROUND_TILE_WIDTH,
  GROUND_SEGMENT_MIN,
  GROUND_SEGMENT_MAX,
  GAP_WIDTH_MIN,
  GAP_WIDTH_MAX,
  GAP_PROBABILITY,
  SCROLL_SPEED_INITIAL,
  SCROLL_SPEED_MAX,
  SCROLL_SPEED_INCREMENT,
  SPEED_UP_COIN_INTERVAL,
  COIN_LINE_SPACING,
  COIN_ARC_COUNT,
  COIN_GROUND_Y_OFFSET,
  COIN_HIGH_Y,
  QUIZ_TRIGGER_COINS,
  FALL_DEATH_Y,
  HIT_FREEZE_DURATION,
  SPEED_BUFF_STEP,
  JUMP_BUFF_STEP,
  SPEED_MULT_MAX,
  JUMP_MULT_MAX,
  EFFECT_DISPLAY_MS,
} from "../constants";

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private grounds!: Phaser.Physics.Arcade.Group;
  private coins!: Phaser.Physics.Arcade.Group;
  private quizItems!: Phaser.Physics.Arcade.Group;

  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private effectText!: Phaser.GameObjects.Text;

  private baseScrollSpeed = SCROLL_SPEED_INITIAL;
  private scrollSpeedMultiplier = 1;
  private gameState: GameState = "playing";
  private nextGroundX = 0;
  private distanceTraveled = 0;
  private totalCoinsCollected = 0;
  private lastQuizCoinThreshold = 0;

  private quizManager!: QuizManager;
  private effectDisplayTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    this.score = 0;
    this.baseScrollSpeed = SCROLL_SPEED_INITIAL;
    this.scrollSpeedMultiplier = 1;
    this.gameState = "playing";
    this.nextGroundX = 0;
    this.distanceTraveled = 0;
    this.totalCoinsCollected = 0;
    this.lastQuizCoinThreshold = 0;

    // Extend world bounds downward for fall death
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT + 200);

    this.createGroups();
    this.createPlayer();
    this.createUI();
    this.setupCollisions();
    this.setupInput();
    this.createQuizManager();
    this.fillInitialGround();
  }

  private createGroups(): void {
    this.grounds = this.physics.add.group({
      runChildUpdate: true,
      allowGravity: false,
      immovable: true,
    });
    this.coins = this.physics.add.group({
      runChildUpdate: true,
      allowGravity: false,
      immovable: true,
    });
    this.quizItems = this.physics.add.group({
      runChildUpdate: true,
      allowGravity: false,
      immovable: true,
    });
  }

  private createPlayer(): void {
    const playerY = GROUND_Y - GROUND_HEIGHT / 2 - PLAYER_SIZE / 2;
    this.player = new Player(this, PLAYER_X, playerY);
  }

  private createUI(): void {
    this.scoreText = this.add
      .text(GAME_WIDTH - 20, 20, "0", {
        fontFamily: "monospace",
        fontSize: "28px",
        color: "#333333",
        fontStyle: "bold",
      })
      .setOrigin(1, 0)
      .setDepth(5);

    this.add
      .text(GAME_WIDTH - 80, 22, "COIN", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#d4a017",
        fontStyle: "bold",
      })
      .setOrigin(1, 0)
      .setDepth(5);

    this.effectText = this.add
      .text(GAME_WIDTH / 2, 20, "", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#ffffff",
        fontStyle: "bold",
        backgroundColor: "#00000066",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5, 0)
      .setDepth(10)
      .setAlpha(0);
  }

  private setupCollisions(): void {
    this.physics.add.collider(this.player, this.grounds);

    this.physics.add.overlap(
      this.player,
      this.coins,
      this.onCollectCoin,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.quizItems,
      this.onCollectQuizItem,
      undefined,
      this
    );
  }

  private setupInput(): void {
    this.input.keyboard?.on("keydown-SPACE", this.handleJumpDown, this);
    this.input.keyboard?.on("keydown-UP", this.handleJumpDown, this);
    this.input.keyboard?.on("keyup-SPACE", this.handleJumpUp, this);
    this.input.keyboard?.on("keyup-UP", this.handleJumpUp, this);
    this.input.on("pointerdown", this.handleJumpDown, this);
    this.input.on("pointerup", this.handleJumpUp, this);
  }

  private createQuizManager(): void {
    this.quizManager = new QuizManager(this, this.quizItems, {
      getScrollSpeed: () => this.getEffectiveSpeed(),
      applySpeedUp: () => this.applySpeedUp(),
      applyJumpUp: () => this.applyJumpUp(),
      setGameState: (state: GameState) => {
        this.gameState = state;
      },
      addScore: (amount: number) => {
        this.score = Math.max(0, this.score + amount);
        this.scoreText.setText(String(this.score));
      },
    });
  }

  private handleJumpDown = (): void => {
    if (this.gameState !== "game_over") {
      this.player.requestJump(this.time.now);
    }
  };

  private handleJumpUp = (): void => {
    this.player.releaseJump();
  };

  // ---- Ground spawning ----

  private fillInitialGround(): void {
    while (this.nextGroundX < GAME_WIDTH + GROUND_TILE_WIDTH) {
      const tileCount = Phaser.Math.Between(
        GROUND_SEGMENT_MIN,
        GROUND_SEGMENT_MAX
      );
      const width = tileCount * GROUND_TILE_WIDTH;
      this.spawnGroundSegment(this.nextGroundX + width / 2, width);
      this.spawnGroundCoins(this.nextGroundX, width);
      this.nextGroundX += width;
    }
  }

  private spawnGroundSegment(centerX: number, width: number): void {
    const seg = new GroundSegment(this, centerX, GROUND_Y, width);
    this.grounds.add(seg);
    seg.setScrollSpeed(this.getEffectiveSpeed());
  }

  private spawnNewGround(): void {
    while (this.nextGroundX < GAME_WIDTH + GROUND_TILE_WIDTH * 2) {
      // Maybe insert a gap
      if (this.distanceTraveled > 800 && Math.random() < GAP_PROBABILITY) {
        const gapWidth = Phaser.Math.Between(GAP_WIDTH_MIN, GAP_WIDTH_MAX);
        this.spawnArcCoins(this.nextGroundX, gapWidth);
        this.nextGroundX += gapWidth;
      }

      const tileCount = Phaser.Math.Between(
        GROUND_SEGMENT_MIN,
        GROUND_SEGMENT_MAX
      );
      const width = tileCount * GROUND_TILE_WIDTH;
      this.spawnGroundSegment(this.nextGroundX + width / 2, width);

      // Coin patterns
      const pattern = Math.random();
      if (pattern < 0.5) {
        this.spawnGroundCoins(this.nextGroundX, width);
      } else if (pattern < 0.8) {
        this.spawnHighCoins(this.nextGroundX, width);
      } else {
        this.spawnGroundCoins(this.nextGroundX, width);
        this.spawnHighCoins(
          this.nextGroundX + COIN_LINE_SPACING * 2,
          width / 2
        );
      }

      this.nextGroundX += width;
    }
  }

  // ---- Coin spawning ----

  private spawnGroundCoins(startX: number, segWidth: number): void {
    const groundTop = GROUND_Y - GROUND_HEIGHT / 2;
    const y = groundTop + COIN_GROUND_Y_OFFSET;
    const count = Math.floor(segWidth / COIN_LINE_SPACING);
    const speed = this.getEffectiveSpeed();

    for (let i = 0; i < count; i++) {
      const x = startX + COIN_LINE_SPACING / 2 + i * COIN_LINE_SPACING;
      const coin = new Coin(this, x, y);
      this.coins.add(coin);
      coin.setScrollSpeed(speed);
    }
  }

  private spawnHighCoins(startX: number, segWidth: number): void {
    const y = COIN_HIGH_Y;
    const count = Math.min(5, Math.floor(segWidth / COIN_LINE_SPACING));
    const speed = this.getEffectiveSpeed();

    for (let i = 0; i < count; i++) {
      const x = startX + COIN_LINE_SPACING / 2 + i * COIN_LINE_SPACING;
      const coin = new Coin(this, x, y);
      this.coins.add(coin);
      coin.setScrollSpeed(speed);
    }
  }

  private spawnArcCoins(gapStartX: number, gapWidth: number): void {
    const speed = this.getEffectiveSpeed();
    const groundTop = GROUND_Y - GROUND_HEIGHT / 2;

    for (let i = 0; i < COIN_ARC_COUNT; i++) {
      const t = i / (COIN_ARC_COUNT - 1);
      const x = gapStartX + gapWidth * t;
      const arcHeight = 120;
      const y = groundTop - 30 - arcHeight * 4 * t * (1 - t);

      const coin = new Coin(this, x, y);
      this.coins.add(coin);
      coin.setScrollSpeed(speed);
    }
  }

  // ---- Coin collection ----

  private onCollectCoin: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _player,
    coinObj
  ): void => {
    const coin = coinObj as Coin;
    coin.destroy();

    this.score++;
    this.totalCoinsCollected++;
    this.scoreText.setText(String(this.score));

    // Speed increase
    if (this.totalCoinsCollected % SPEED_UP_COIN_INTERVAL === 0) {
      this.baseScrollSpeed = Math.max(
        this.baseScrollSpeed + SCROLL_SPEED_INCREMENT,
        SCROLL_SPEED_MAX
      );
    }

    // Quiz trigger
    const currentThreshold =
      Math.floor(this.totalCoinsCollected / QUIZ_TRIGGER_COINS) *
      QUIZ_TRIGGER_COINS;
    if (
      currentThreshold > this.lastQuizCoinThreshold &&
      this.totalCoinsCollected >= QUIZ_TRIGGER_COINS &&
      this.gameState === "playing"
    ) {
      this.lastQuizCoinThreshold = currentThreshold;
      this.quizManager.startQuiz();
    }
  };

  // ---- Quiz item collection ----

  private onCollectQuizItem: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _player,
    itemObj
  ): void => {
    if (this.gameState !== "quiz_active") return;
    const item = itemObj as QuizItem;
    this.quizManager.handleCollection(item);
  };

  // ---- Buff / Debuff ----

  private getEffectiveSpeed(): number {
    return this.baseScrollSpeed * this.scrollSpeedMultiplier;
  }

  private applySpeedUp(): void {
    this.scrollSpeedMultiplier = Phaser.Math.Clamp(
      this.scrollSpeedMultiplier * SPEED_BUFF_STEP,
      1,
      SPEED_MULT_MAX
    );
    this.showEffect("SPEED UP!", "#3498db");
  }

  private applyJumpUp(): void {
    this.player.jumpMultiplier = Phaser.Math.Clamp(
      this.player.jumpMultiplier * JUMP_BUFF_STEP,
      1,
      JUMP_MULT_MAX
    );
    this.showEffect("JUMP UP!", "#2ecc71");
  }

  private showEffect(text: string, color: string): void {
    this.effectText.setText(text).setColor(color).setAlpha(1);
    this.effectDisplayTimer?.remove();
    this.effectDisplayTimer = this.time.delayedCall(EFFECT_DISPLAY_MS, () => {
      this.effectText.setAlpha(0);
    });
  }

  // ---- Sync scroll speed to all entities ----

  private syncScrollSpeed(): void {
    const speed = this.getEffectiveSpeed();

    this.grounds.getChildren().forEach((obj) => {
      (obj as GroundSegment).setScrollSpeed(speed);
    });
    this.coins.getChildren().forEach((obj) => {
      (obj as Coin).setScrollSpeed(speed);
    });
    this.quizItems.getChildren().forEach((obj) => {
      (obj as QuizItem).setScrollSpeed(speed);
    });
  }

  // ---- Main update loop ----

  update(time: number, delta: number): void {
    if (this.gameState === "game_over") return;

    this.player.update(time, delta);

    const scrollDelta = Math.abs(this.getEffectiveSpeed()) * (delta / 1000);
    this.distanceTraveled += scrollDelta;

    // Advance nextGroundX with scroll
    this.nextGroundX += this.getEffectiveSpeed() * (delta / 1000);

    this.spawnNewGround();
    this.syncScrollSpeed();

    // Fall death
    if (this.player.y > FALL_DEATH_Y) {
      this.triggerGameOver();
    }
  }

  private triggerGameOver(): void {
    if (this.gameState === "game_over") return;
    this.gameState = "game_over";

    this.quizManager.cleanup();

    this.effectDisplayTimer?.remove();

    this.grounds.getChildren().forEach((obj) => {
      (obj as GroundSegment).setVelocityX(0);
    });
    this.coins.getChildren().forEach((obj) => {
      (obj as Coin).setVelocityX(0);
    });

    this.player.setTint(0xff0000);

    this.time.delayedCall(HIT_FREEZE_DURATION, () => {
      this.scene.start("GameOverScene", { score: this.score });
    });
  }
}
