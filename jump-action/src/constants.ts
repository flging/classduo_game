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
export const QUIZ_INTERVAL_MS = 8000;    // 8초마다 퀴즈
export const QUIZ_ANNOUNCE_MS = 3000;
export const QUIZ_WINDOW_MS = 5000;
export const QUIZ_RESULT_MS = 1000;
export const QUIZ_ITEM_SIZE = 44;
export const QUIZ_WORD_WIDTH = 90;
export const QUIZ_WORD_HEIGHT = 40;
export const QUIZ_ITEM_HIGH_Y = 200;
export const QUIZ_ITEM_SPACING_X = 200;
export const COLOR_QUIZ_WORD = 0x3498db;

// Buff / Debuff (stack-based: multiplier = base ^ stacks)
export const SPEED_STACK_BASE = 1.15;    // 스택당 15%
export const JUMP_STACK_BASE = 1.15;     // 스택당 15%
export const SPEED_MULT_MIN = 0.4;
export const SPEED_MULT_MAX = 2.5;
export const JUMP_MULT_MIN = 0.4;
export const JUMP_MULT_MAX = 2.5;
export const JUMP_COUNT_MIN = 1;
export const JUMP_COUNT_MAX = 4;
export const SCORE_BONUS = 30;
export const EFFECT_DISPLAY_MS = 1500;

// HP gauge (Cookie Run style)
export const HP_MAX = 60000;  // 60초
export const HP_ICON_RADIUS = 14;
export const HP_BAR_X = 36;
export const HP_BAR_Y = 8;
export const HP_BAR_WIDTH = 200;
export const HP_BAR_HEIGHT = 22;
export const HP_BAR_RADIUS = 11;
export const HP_BAR_PADDING = 3;
export const COLOR_HP_HEART = 0xe74c3c;
export const COLOR_HP_HEART_SHINE = 0xf1948a;
export const HP_MAX_BOOST = 5000;          // 최대 체력 +5초
export const HP_RESTORE_AMOUNT = 8000;     // 현재 체력 +8초
export const HP_DECAY_STACK_BASE = 1.15;   // 감소 속도 스택당 15%
export const HP_DECAY_MULT_MIN = 0.4;
export const HP_DECAY_MULT_MAX = 2.5;
export const HP_MAX_MIN = 15000;           // 최대 체력 하한 (15초)

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
