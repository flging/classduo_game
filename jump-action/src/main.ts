import * as Phaser from "phaser";
import { createGameConfig } from "./config";

new Phaser.Game(createGameConfig(document.body));

// Request fullscreen on first touch (mobile)
function requestFullscreen() {
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
  };
  if (el.requestFullscreen) {
    el.requestFullscreen().catch(() => {});
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen().catch(() => {});
  }
  document.removeEventListener("touchstart", requestFullscreen);
}
document.addEventListener("touchstart", requestFullscreen, { once: true });
