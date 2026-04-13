/**
 * Централизованные константы и конфигурация игры
 * Все балансовые параметры вынесены для удобной настройки
 */

// === ЭВОЛЮЦИЯ ===
export const EVOLUTION_NAMES = [
  'Галька',
  'Камешек',
  'Камень',
  'Булыжник',
  'Валун',
  'Большой валун',
  'Пригорок',
  'Холм',
  'Горка',
  'Гора',
  'Скальник',
  'Скала',
] as const;

export const EVOLUTION_MULTIPLIERS = [
  1.0, 2.5, 5.0, 10.0, 18.0, 30.0,
  50.0, 80.0, 130.0, 200.0, 350.0, 600.0,
] as const;

export const BASE_EVOLUTION_COST = 100;
export const EVOLUTION_INFLATION_COEFF = 1.5;

// === КЛИК ===
export const CLICK_BASE_PRICE = 10;
export const CLICK_PRICE_MULTIPLIER = 1.4;
export const CLICK_BASE_INCOME = 1;
export const CLICK_INCOME_PER_LEVEL = 2;
export const CLICK_MAX_LEVEL = Infinity;

// === ВОРОН ===
export const CROW_BASE_PRICE = 50;
export const CROW_UPGRADE_PRICE_MULTIPLIER = 1.6;
export const CROW_BASE_INCOME = 0.5;
export const CROW_INCOME_PER_LEVEL = 0.3;
export const CROW_LEVEL_BONUS = 0.1;
export const CROW_MAX_LEVEL = 20;

// === СОБЫТИЯ ===
export const EVENT_CHECK_INTERVAL_MIN = 45;
export const EVENT_CHECK_INTERVAL_MAX = 60;
export const EVENT_COOLDOWN = 45;
export const EVENT_MAX_ACTIVE = 1;

// Вероятности событий (в процентах)
export const EVENT_PROBABILITIES = {
  storm: 0.15,
  wind: 0.10,
  rain: 0.12,
  hunter: 0.08,
  meteorite: 0.002, // 0.2%
} as const;

// Параметры событий
export const EVENT_CONFIG = {
  storm: { lightningChance: 0.01, lightningLoss: 0.50 },
  wind: { tickInterval: 5, tickLoss: 0.05, durationMin: 15, durationMax: 25 },
  rain: { loss: 0.10 },
  hunter: { duration: 180_000 }, // 3 мин в мс
  meteorite: { minEvolutionLevel: 7 },
} as const;

// === ЗАЩИТА ===
export const FORTUNE_BASE_REDUCTION = 0.08;
export const FORTUNE_MAX_LEVEL = 15;
export const FORTUNE_MIN_CHANCE_MULTIPLIER = 0.20; // мин. 20% от базового

export const FORTRESS_BASE_REDUCTION = 0.12;
export const FORTRESS_MAX_LEVEL = 10;
export const FORTRESS_MIN_LOSS_MULTIPLIER = 0.30; // мин. 30% от базовой

// === БАЛАНС ===
export const MIN_SCORE_FLOOR = 50;
export const MAX_SESSION_LOSS_PERCENT = 0.40;
export const MAX_OFFLINE_HOURS = 4;

// === СОХРАНЕНИЯ ===
export const SAVE_INTERVAL = 30_000; // 30 сек

// === UI ===
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const SCALE_MODE = 'FIT';
