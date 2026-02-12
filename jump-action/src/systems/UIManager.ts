import Phaser from "phaser";
import {
  GAME_WIDTH,
  HP_ICON_RADIUS,
  HP_BAR_X,
  HP_BAR_Y,
  HP_BAR_WIDTH,
  HP_BAR_HEIGHT,
  HP_BAR_RADIUS,
  HP_BAR_PADDING,
  COLOR_HP_HEART,
  COLOR_HP_HEART_SHINE,
  HP_LOW_THRESHOLD,
  HP_HEARTBEAT_DURATION,
  HP_DAMAGE_FLASH_MS,
  DEPTH_HUD,
  DEPTH_QUIZ,
  EFFECT_DISPLAY_MS,
  SCORE_BOUNCE_SCALE,
  SCORE_BOUNCE_DURATION,
} from "../constants";

export class UIManager {
  private scene: Phaser.Scene;

  // Score
  private scoreText!: Phaser.GameObjects.Text;
  private displayedScore = 0;
  private targetScore = 0;

  // Effect text
  private effectText!: Phaser.GameObjects.Text;
  private effectDisplayTimer?: Phaser.Time.TimerEvent;

  // HP gauge
  private hpGaugeFrame!: Phaser.GameObjects.Graphics;
  private hpGaugeFill!: Phaser.GameObjects.Graphics;
  private displayedHpRatio = 1;
  private lastHpRatio = 1;
  private hpDamageFlashTimer = 0;

  // Heartbeat
  private heartbeatTween?: Phaser.Tweens.Tween;
  private heartIcon!: Phaser.GameObjects.Graphics;
  private isHeartbeating = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    // Score
    this.scoreText = this.scene.add
      .text(GAME_WIDTH - 20, 20, "0", {
        fontFamily: "monospace",
        fontSize: "28px",
        color: "#333333",
        fontStyle: "bold",
      })
      .setOrigin(1, 0)
      .setDepth(DEPTH_HUD);

    this.scene.add
      .text(GAME_WIDTH - 80, 22, "COIN", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#d4a017",
        fontStyle: "bold",
      })
      .setOrigin(1, 0)
      .setDepth(DEPTH_HUD);

    // HP gauge frame
    this.hpGaugeFrame = this.scene.add.graphics().setDepth(DEPTH_HUD);
    this.heartIcon = this.scene.add.graphics().setDepth(DEPTH_HUD);
    this.drawHpGaugeFrame();

    this.hpGaugeFill = this.scene.add.graphics().setDepth(DEPTH_HUD);

    // Effect text
    this.effectText = this.scene.add
      .text(GAME_WIDTH / 2, 20, "", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#ffffff",
        fontStyle: "bold",
        backgroundColor: "#00000066",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH_QUIZ)
      .setAlpha(0);

    this.displayedScore = 0;
    this.targetScore = 0;
    this.displayedHpRatio = 1;
    this.lastHpRatio = 1;
  }

  // ── Score ──

  setScore(score: number): void {
    if (score !== this.targetScore) {
      this.targetScore = score;
      // Bounce
      this.scene.tweens.add({
        targets: this.scoreText,
        scaleX: SCORE_BOUNCE_SCALE,
        scaleY: SCORE_BOUNCE_SCALE,
        duration: SCORE_BOUNCE_DURATION / 2,
        yoyo: true,
        ease: "Back.Out",
      });
    }
  }

  showEffect(text: string, color: string): void {
    this.effectText.setText(text).setColor(color).setAlpha(1);
    this.effectDisplayTimer?.remove();
    this.effectDisplayTimer = this.scene.time.delayedCall(EFFECT_DISPLAY_MS, () => {
      this.effectText.setAlpha(0);
    });
  }

  // ── HP Gauge ──

  updateHpGauge(hp: number, hpMax: number): void {
    const ratio = hp / hpMax;

    // Detect sudden damage for flash
    if (ratio < this.lastHpRatio - 0.05) {
      this.hpDamageFlashTimer = HP_DAMAGE_FLASH_MS;
    }
    this.lastHpRatio = ratio;

    // Heartbeat when low HP
    if (ratio <= HP_LOW_THRESHOLD && ratio > 0) {
      if (!this.isHeartbeating) {
        this.isHeartbeating = true;
        this.heartbeatTween = this.scene.tweens.add({
          targets: this.heartIcon,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: HP_HEARTBEAT_DURATION / 2,
          yoyo: true,
          repeat: -1,
          ease: "Sine.InOut",
        });
      }
    } else if (this.isHeartbeating) {
      this.isHeartbeating = false;
      this.heartbeatTween?.stop();
      this.heartIcon.setScale(1);
    }

    this.drawHpFill(ratio);
  }

  private drawHeartIcon(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    r: number
  ): void {
    const topY = cy - r * 0.4;
    const botY = cy + r;
    const lx = cx - r * 0.55;
    const rx = cx + r * 0.55;
    const bulgeR = r * 0.55;

    g.fillStyle(COLOR_HP_HEART, 1);
    g.beginPath();
    g.arc(lx, topY, bulgeR, Math.PI, 0, false);
    g.arc(rx, topY, bulgeR, Math.PI, 0, false);
    g.lineTo(cx, botY);
    g.closePath();
    g.fillPath();

    g.lineStyle(2, 0x922b21, 1);
    g.beginPath();
    g.arc(lx, topY, bulgeR, Math.PI, 0, false);
    g.arc(rx, topY, bulgeR, Math.PI, 0, false);
    g.lineTo(cx, botY);
    g.closePath();
    g.strokePath();

    g.fillStyle(COLOR_HP_HEART_SHINE, 0.6);
    g.fillCircle(lx - bulgeR * 0.15, topY - bulgeR * 0.2, bulgeR * 0.3);
  }

  private drawHpGaugeFrame(): void {
    const g = this.hpGaugeFrame;
    g.clear();

    const barW = HP_BAR_WIDTH;

    // Bar frame
    g.fillStyle(0x1a1a2e, 1);
    g.fillRoundedRect(HP_BAR_X, HP_BAR_Y, barW, HP_BAR_HEIGHT, HP_BAR_RADIUS);
    g.lineStyle(2, 0x3d3d5c, 1);
    g.strokeRoundedRect(HP_BAR_X, HP_BAR_Y, barW, HP_BAR_HEIGHT, HP_BAR_RADIUS);

    // Segment lines at 25%, 50%, 75%
    g.lineStyle(1, 0x3d3d5c, 0.4);
    const pad = HP_BAR_PADDING;
    const innerW = barW - pad * 2;
    for (const frac of [0.25, 0.5, 0.75]) {
      const lx = HP_BAR_X + pad + innerW * frac;
      g.lineBetween(lx, HP_BAR_Y + pad, lx, HP_BAR_Y + HP_BAR_HEIGHT - pad);
    }

    // Heart icon
    const iconCx = HP_ICON_RADIUS + 4;
    const iconCy = HP_BAR_Y + HP_BAR_HEIGHT / 2;
    this.drawHeartIcon(this.heartIcon, iconCx, iconCy, HP_ICON_RADIUS);
  }

  private drawHpFill(ratio: number): void {
    const barW = HP_BAR_WIDTH;
    const pad = HP_BAR_PADDING;
    const innerW = barW - pad * 2;
    const innerH = HP_BAR_HEIGHT - pad * 2;
    const innerR = HP_BAR_RADIUS - pad;

    // Smooth lerp toward target
    this.displayedHpRatio += (ratio - this.displayedHpRatio) * 0.15;
    const displayRatio = Phaser.Math.Clamp(this.displayedHpRatio, 0, 1);
    const fillW = Math.max(0, innerW * displayRatio);

    let color: number;
    let shineColor: number;
    if (displayRatio > 0.5) {
      color = 0x2ecc71;
      shineColor = 0x58d68d;
    } else if (displayRatio > 0.25) {
      color = 0xf39c12;
      shineColor = 0xf5b041;
    } else {
      color = 0xe74c3c;
      shineColor = 0xec7063;
    }

    // Damage flash override
    if (this.hpDamageFlashTimer > 0) {
      color = 0xffffff;
      shineColor = 0xffffff;
    }

    const g = this.hpGaugeFill;
    g.clear();
    if (fillW <= 0) return;

    const fx = HP_BAR_X + pad;
    const fy = HP_BAR_Y + pad;

    g.fillStyle(color, 1);
    g.fillRoundedRect(fx, fy, fillW, innerH, {
      tl: innerR,
      tr: fillW >= innerW - innerR ? innerR : 0,
      bl: innerR,
      br: fillW >= innerW - innerR ? innerR : 0,
    });

    g.fillStyle(shineColor, 0.4);
    g.fillRoundedRect(fx, fy, fillW, innerH / 2, {
      tl: innerR,
      tr: fillW >= innerW - innerR ? innerR : 0,
      bl: 0,
      br: 0,
    });
  }

  // ── Update ──

  update(delta: number): void {
    // Lerp score
    if (this.displayedScore !== this.targetScore) {
      const diff = this.targetScore - this.displayedScore;
      const step = Math.ceil(Math.abs(diff) * 0.2);
      if (Math.abs(diff) <= 1) {
        this.displayedScore = this.targetScore;
      } else {
        this.displayedScore += Math.sign(diff) * Math.min(step, Math.abs(diff));
      }
      this.scoreText.setText(String(this.displayedScore));
    }

    // Damage flash timer
    if (this.hpDamageFlashTimer > 0) {
      this.hpDamageFlashTimer -= delta;
    }
  }

  cleanup(): void {
    this.effectDisplayTimer?.remove();
    this.heartbeatTween?.stop();
  }
}
