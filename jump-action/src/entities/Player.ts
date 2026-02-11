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
} from "../constants";

export class Player extends Phaser.Physics.Arcade.Sprite {
  private jumpCount = 0;
  private maxJumps = MAX_JUMPS;

  private lastGroundedAt = 0;
  private jumpBufferedAt = 0;
  private jumpHeld = false;

  jumpMultiplier = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // No world bounds — fall death is handled by GameScene
  }

  update(time: number, _delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;

    if (onGround) {
      this.lastGroundedAt = time;
      this.jumpCount = 0;
    }

    if (onGround && time - this.jumpBufferedAt < JUMP_BUFFER_MS) {
      this.executeJump();
    }

    // Clamp left side only
    if (this.x < PLAYER_SIZE / 2) {
      this.x = PLAYER_SIZE / 2;
      body.setVelocityX(0);
    }

    this.applyVariableGravity(body);
  }

  requestJump(time: number): void {
    this.jumpHeld = true;
    this.jumpBufferedAt = time;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;
    const inCoyoteWindow = time - this.lastGroundedAt < COYOTE_TIME_MS;

    if (this.jumpCount === 0 && (onGround || inCoyoteWindow)) {
      this.executeJump();
    } else if (this.jumpCount === 1) {
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
    this.jumpMultiplier = 1;
    this.clearTint();
    this.setVelocity(0, 0);
    (this.body as Phaser.Physics.Arcade.Body).setGravityY(0);
  }

  private executeJump(): void {
    this.setVelocityY(JUMP_VELOCITY * this.jumpMultiplier);
    this.jumpCount++;
    this.jumpBufferedAt = 0;
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
