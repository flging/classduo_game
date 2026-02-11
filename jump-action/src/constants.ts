// Game dimensions
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 400;

// Physics
export const GRAVITY = 1200;
export const JUMP_VELOCITY = -450;
export const MAX_JUMPS = 2;

// Jump feel
export const JUMP_BUFFER_MS = 100;
export const COYOTE_TIME_MS = 80;
export const LOW_JUMP_GRAVITY_MULT = 3;
export const FALL_GRAVITY_MULT = 1.5;

// Player
export const PLAYER_X = 100;
export const PLAYER_SIZE = 40;

// Ground
export const GROUND_HEIGHT = 40;
export const GROUND_Y = GAME_HEIGHT - GROUND_HEIGHT / 2;

// Ground segments (scrolling)
export const GROUND_TILE_WIDTH = 200;
export const GROUND_SEGMENT_MIN = 2;
export const GROUND_SEGMENT_MAX = 4;
export const GAP_WIDTH_MIN = 100;
export const GAP_WIDTH_MAX = 200;
export const GAP_PROBABILITY = 0.3;
export const SCROLL_SPEED_INITIAL = -250;
export const SCROLL_SPEED_MAX = -500;
export const SCROLL_SPEED_INCREMENT = -10;

// Coins
export const COIN_SIZE = 20;
export const COIN_SCORE = 1;
export const COIN_LINE_SPACING = 40;
export const COIN_ARC_COUNT = 5;
export const COIN_GROUND_Y_OFFSET = -30;
export const COIN_HIGH_Y = 220;
export const COLOR_COIN = 0xf1c40f;

// Quiz
export const QUIZ_TRIGGER_COINS = 30;
export const QUIZ_ANNOUNCE_MS = 800;
export const QUIZ_WINDOW_MS = 5000;
export const QUIZ_RESULT_MS = 1000;
export const QUIZ_ITEM_SIZE = 44;
export const QUIZ_WORD_WIDTH = 90;
export const QUIZ_WORD_HEIGHT = 40;
export const QUIZ_ITEM_HIGH_Y = 200;
export const QUIZ_ITEM_SPACING_X = 200;
export const COLOR_QUIZ_WORD = 0x3498db;

// Buff (permanent, cumulative)
export const SPEED_BUFF_STEP = 1.15;     // 속도 15% 증가 (누적)
export const JUMP_BUFF_STEP = 1.15;      // 점프력 15% 증가 (누적)
export const SPEED_MULT_MAX = 2.5;       // 속도 배율 상한
export const JUMP_MULT_MAX = 2.5;        // 점프 배율 상한
export const SCORE_BONUS = 30;           // 점수 보너스
export const EFFECT_DISPLAY_MS = 1500;   // 효과 텍스트 표시 시간

// Fall death
export const FALL_DEATH_Y = GAME_HEIGHT + 50;

// Game Over
export const HIT_FREEZE_DURATION = 800;
export const RESTART_DELAY = 500;

// Speed increase per N coins
export const SPEED_UP_COIN_INTERVAL = 10;

// Colors
export const COLOR_SKY = 0xe8f4f8;
export const COLOR_PLAYER = 0x4a90d9;
export const COLOR_GROUND = 0x8b7355;
export const COLOR_GROUND_TOP = 0x6b8e23;
