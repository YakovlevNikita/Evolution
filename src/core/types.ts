/**
 * Основные типы и интерфейсы игры
 */

// === Состояние игры ===
export interface GameState {
  /** Текущий уровень эволюции (1-12) */
  level: number;
  /** Текущие очки */
  score: number;
  /** Уровень улучшения клика */
  clickLevel: number;
  /** Куплен ли Ворон */
  crowOwned: boolean;
  /** Уровень Ворона */
  crowLevel: number;
  /** Уровень навыка Фортуна */
  fortuneLevel: number;
  /** Уровень навыка Крепость камня */
  fortressLevel: number;
  /** Timestamp последнего сохранения */
  lastSave: number;
  /** Timestamp окончания кулдауна Ворона (0 если активен) */
  crowDisabledUntil: number;
  /** Активное событие (null если нет) */
  activeEvent: EventData | null;
  /** Флаг завершения туториала */
  tutorialCompleted: boolean;
}

// === Данные активного события ===
export interface EventData {
  type: EventType;
  startedAt: number;
  duration?: number;
  tickInterval?: number;
  lastTickAt?: number;
}

// === Типы событий ===
export type EventType = 'storm' | 'wind' | 'rain' | 'hunter' | 'meteorite';

// === Конфигурация апгрейда ===
export interface UpgradeConfig {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  priceMultiplier: number;
  maxLevel: number;
  /** Функция расчета эффекта от уровня */
  effect: (level: number) => number;
}

// === Типы апгрейдов ===
export type UpgradeType = 'click' | 'crow' | 'fortune' | 'fortress' | 'evolution';

// === События для EventEmitter ===
export type GameEventType =
  | 'score:changed'
  | 'level:changed'
  | 'upgrade:purchased'
  | 'evolution:complete'
  | 'event:start'
  | 'event:end'
  | 'crow:disabled'
  | 'crow:enabled'
  | 'game:saved'
  | 'game:loaded';

export interface GameEventMap {
  'score:changed': { oldScore: number; newScore: number };
  'level:changed': { oldLevel: number; newLevel: number };
  'upgrade:purchased': { type: UpgradeType; level: number; cost: number };
  'evolution:complete': { oldLevel: number; newLevel: number };
  'event:start': { eventData: EventData };
  'event:end': { eventType: EventType };
  'crow:disabled': { until: number };
  'crow:enabled': void;
  'game:saved': { timestamp: number };
  'game:loaded': { state: GameState };
}

// === Сериализуемое состояние (для сохранений) ===
export interface SerializableGameState {
  level: number;
  score: number;
  clickLevel: number;
  crowOwned: boolean;
  crowLevel: number;
  fortuneLevel: number;
  fortressLevel: number;
  lastSave: number;
  crowDisabledUntil: number;
  tutorialCompleted: boolean;
  // activeEvent не сериализуется — сбрасывается при загрузке
}

// === Конфигурация рекламы ===
export type AdType = 'rewarded' | 'interstitial' | 'banner';

export interface RewardedAdConfig {
  type: 'double_income' | 'cancel_event' | 'revive_crow' | 'triple_click';
  duration: number; // длительность бонуса в мс (0 = мгновенный)
  multiplier: number;
}
