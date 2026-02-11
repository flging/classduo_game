import Phaser from "phaser";

export class Coin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "coin");

    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  setScrollSpeed(speed: number): void {
    this.setVelocityX(speed);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this.x + this.width / 2 < 0) {
      this.destroy();
    }
  }
}
