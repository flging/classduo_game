import Phaser from "phaser";
import {
  GRAVITY,
  JUMP_VELOCITY,
  MAX_JUMPS,
  JUMP_BUFFER_MS,
  COYOTE_TIME_MS,
  LOW_JUMP_GRAVITY_MULT,
  FALL_GRAVITY_MULT,
  PLAYER_SIZE,
  PLAYER_TEX_HEIGHT,
  COLOR_PLAYER,
  TRAIL_LENGTH,
} from "../constants";

// 720° / 0.4s = 1800°/s (same speed as old 2-rotation tween)
const SPIN_SPEED = 1800;

export class Player extends Phaser.Physics.Arcade.Sprite {
  private jumpCount = 0;
  maxJumps = MAX_JUMPS;

  private lastGroundedAt = 0;
  private jumpBufferedAt = 0;
  private jumpHeld = false;
  private justJumped = false;
  private spinning = false;
  private isRunning = false;
  private wasInAir = false;
  private trail: Phaser.GameObjects.Graphics;
  private prevPositions: { x: number; y: number }[] = [];

  jumpMultiplier = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player_run0");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics body covers only the hoodie body, not the legs
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(30, 38);
    body.setOffset(5, 5);

    // Spin ghost trail (rendered behind player)
    this.trail = scene.add.graphics();
    this.trail.setDepth((this.depth ?? 0) - 1);

    // Run animation (2-frame leg alternation)
    if (!scene.anims.exists("run")) {
      scene.anims.create({
        key: "run",
        frames: [
          { key: "player_run0" },
          { key: "player_run1" },
        ],
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  update(time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;

    // Landing detection → emit event for dust effect
    if (this.wasInAir && onGround) {
      this.emit('land', this.x, this.y);
    }
    this.wasInAir = !onGround;

    if (onGround) {
      this.lastGroundedAt = time;
      if (!this.justJumped) {
        this.jumpCount = 0;
      }
      if (this.spinning) {
        this.spinning = false;
        this.setAngle(0);
      }
    } else {
      this.justJumped = false;
    }

    if (onGround && time - this.jumpBufferedAt < JUMP_BUFFER_MS) {
      this.executeJump();
    }

    // Clamp left side only
    if (this.x < PLAYER_SIZE / 2) {
      this.x = PLAYER_SIZE / 2;
      body.setVelocityX(0);
    }

    // Animation state management
    if (this.spinning) {
      // Continuous rotation until landing
      this.angle += SPIN_SPEED * (delta / 1000);
      if (this.texture.key !== "player_spin") {
        this.stop();
        this.setTexture("player_spin");
        this.isRunning = false;
      }
    } else if (onGround) {
      if (!this.isRunning) {
        this.play("run");
        this.isRunning = true;
      }
    } else {
      // In the air (no spin) → jump frame with >< eyes
      if (this.isRunning || this.texture.key !== "player_jump") {
        this.stop();
        this.setTexture("player_jump");
        this.isRunning = false;
      }
    }

    // Ensure body size stays correct after texture swap
    body.setSize(30, 38);
    body.setOffset(5, 5);

    this.applyVariableGravity(body);

    // Spin ghost trail
    if (this.spinning) {
      this.prevPositions.push({ x: this.x, y: this.y });
      if (this.prevPositions.length > TRAIL_LENGTH) {
        this.prevPositions.shift();
      }
      this.trail.clear();
      for (let i = 0; i < this.prevPositions.length; i++) {
        const pos = this.prevPositions[i];
        const t = (i + 1) / this.prevPositions.length;
        const alpha = 0.35 * t;
        const radius = (PLAYER_SIZE / 2) * (0.4 + 0.4 * t);
        this.trail.fillStyle(0xc0392b, alpha);
        this.trail.fillCircle(pos.x, pos.y, radius);
      }
    } else {
      this.trail.clear();
      this.prevPositions.length = 0;
    }
  }

  requestJump(time: number): void {
    this.jumpHeld = true;
    this.jumpBufferedAt = time;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;
    const inCoyoteWindow = time - this.lastGroundedAt < COYOTE_TIME_MS;

    if (this.jumpCount === 0 && (onGround || inCoyoteWindow)) {
      this.executeJump();
    } else if (this.jumpCount > 0 && this.jumpCount < this.maxJumps) {
      this.executeJump();
    }
  }

  releaseJump(): void {
    this.jumpHeld = false;
  }

  resetState(): void {
    this.jumpCount = 0;
    this.lastGroundedAt = 0;
    this.jumpBufferedAt = 0;
    this.jumpHeld = false;
    this.maxJumps = MAX_JUMPS;
    this.jumpMultiplier = 1;
    this.justJumped = false;
    this.spinning = false;
    this.isRunning = false;
    this.wasInAir = false;
    this.trail.clear();
    this.prevPositions.length = 0;
    this.setAngle(0);
    this.clearTint();
    this.setVelocity(0, 0);
    this.stop();
    this.setTexture("player_run0");
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(0);
    body.setSize(30, 38);
    body.setOffset(5, 5);
  }

  clearTrail(): void {
    this.trail.clear();
    this.prevPositions.length = 0;
  }

  destroy(fromScene?: boolean): void {
    this.trail.destroy();
    super.destroy(fromScene);
  }

  private executeJump(): void {
    this.setVelocityY(JUMP_VELOCITY * this.jumpMultiplier);
    this.jumpCount++;
    this.jumpBufferedAt = 0;
    this.justJumped = true;
    this.emit('jump', this.x, this.y, this.jumpCount);

    // Spin on 2nd jump and above (continues until landing)
    if (this.jumpCount >= 2) {
      this.spinning = true;
    }
  }

  private applyVariableGravity(body: Phaser.Physics.Arcade.Body): void {
    const vy = body.velocity.y;
    const onGround = body.blocked.down;

    if (onGround) {
      body.setGravityY(0);
    } else if (vy < 0 && !this.jumpHeld) {
      body.setGravityY(GRAVITY * (LOW_JUMP_GRAVITY_MULT - 1));
    } else if (vy > 0) {
      body.setGravityY(GRAVITY * (FALL_GRAVITY_MULT - 1));
    } else {
      body.setGravityY(0);
    }
  }
}
