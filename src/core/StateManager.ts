import EventEmitter from 'events';
import type { GameState, GameEventMap, SerializableGameState } from '@core/types';
import { SAVE_INTERVAL, MIN_SCORE_FLOOR } from '@core/config';

/**
 * Singleton-менеджер состояния игры
 * Реактивные подписки через EventEmitter, автосохранение в localStorage
 */
export class StateManager extends EventEmitter {
  private static instance: StateManager;

  private state: GameState;
  private saveTimer: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    super();
    this.state = this.loadInitialState();
  }

  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  // === Чтение состояния ===

  getScore(): number {
    return this.state.score;
  }

  getLevel(): number {
    return this.state.level;
  }

  getClickLevel(): number {
    return this.state.clickLevel;
  }

  getCrowLevel(): number {
    return this.state.crowLevel;
  }

  isCrowOwned(): boolean {
    return this.state.crowOwned;
  }

  isCrowDisabled(): boolean {
    return Date.now() < this.state.crowDisabledUntil;
  }

  getFortuneLevel(): number {
    return this.state.fortuneLevel;
  }

  getFortressLevel(): number {
    return this.state.fortressLevel;
  }

  getState(): Readonly<GameState> {
    return { ...this.state };
  }

  // === Изменение состояния ===

  addScore(amount: number): void {
    if (amount <= 0) return;
    const oldScore = this.state.score;
    this.state.score += amount;
    this.emit('score:changed', { oldScore, newScore: this.state.score });
  }

  spendScore(amount: number): boolean {
    if (amount < 0 || this.state.score < amount) return false;
    const oldScore = this.state.score;
    this.state.score -= amount;
    this.emit('score:changed', { oldScore, newScore: this.state.score });
    return true;
  }

  canAfford(cost: number): boolean {
    return this.state.score >= cost;
  }

  setClickLevel(level: number): void {
    this.state.clickLevel = Math.max(0, level);
  }

  setCrowOwned(value: boolean): void {
    this.state.crowOwned = value;
  }

  setCrowLevel(level: number): void {
    this.state.crowLevel = Math.max(0, Math.min(level, 20));
  }

  setCrowDisabledUntil(timestamp: number): void {
    this.state.crowDisabledUntil = timestamp;
    if (timestamp > 0) {
      this.emit('crow:disabled', { until: timestamp });
    } else {
      this.emit('crow:enabled');
    }
  }

  setFortuneLevel(level: number): void {
    this.state.fortuneLevel = Math.max(0, Math.min(level, 15));
  }

  setFortressLevel(level: number): void {
    this.state.fortressLevel = Math.max(0, Math.min(level, 10));
  }

  setLevel(level: number): void {
    const oldLevel = this.state.level;
    this.state.level = Math.max(1, Math.min(level, 12));
    if (oldLevel !== this.state.level) {
      this.emit('level:changed', { oldLevel, newLevel: this.state.level });
    }
  }

  applyScoreLoss(percent: number): number {
    const loss = Math.min(Math.max(percent, 0), 1);
    const lostAmount = Math.floor(this.state.score * loss);
    const newScore = Math.max(MIN_SCORE_FLOOR, this.state.score - lostAmount);
    const oldScore = this.state.score;
    this.state.score = newScore;
    this.emit('score:changed', { oldScore, newScore });
    return oldScore - newScore;
  }

  // === Сохранения ===

  startAutoSave(): void {
    if (this.saveTimer) return;
    this.saveTimer = setInterval(() => this.save(), SAVE_INTERVAL);
  }

  stopAutoSave(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
  }

  save(): void {
    try {
      const serializable = this.toSerializable(this.state);
      localStorage.setItem('evolution_pebble_save', JSON.stringify(serializable));
      this.state.lastSave = Date.now();
      this.emit('game:saved', { timestamp: this.state.lastSave });
    } catch (e) {
      console.warn('StateManager: save failed', e);
    }
  }

  load(): void {
    try {
      const raw = localStorage.getItem('evolution_pebble_save');
      if (raw) {
        const serializable = JSON.parse(raw) as SerializableGameState;
        this.mergeSerializable(serializable);
        this.emit('game:loaded', { state: this.getState() });
      }
    } catch (e) {
      console.warn('StateManager: load failed', e);
    }
  }

  reset(): void {
    this.state = this.createDefaultState();
    localStorage.removeItem('evolution_pebble_save');
    this.emit('score:changed', { oldScore: 0, newScore: 0 });
  }

  // === Offline income calculation ===

  calculateOfflineIncome(): number {
    const elapsed = Date.now() - this.state.lastSave;
    if (elapsed <= 0 || !this.state.crowOwned) return 0;

    const maxOffline = 4 * 60 * 60 * 1000; // 4 часа
    const effectiveTime = Math.min(elapsed, maxOffline) / 1000; // в секунды

    // Доход Ворона: (0.5 + crowLevel * 0.3) * (1 + level * 0.1)
    const incomePerSec = (0.5 + this.state.crowLevel * 0.3) * (1 + this.state.level * 0.1);
    return Math.floor(incomePerSec * effectiveTime);
  }

  // === Приватные методы ===

  private loadInitialState(): GameState {
    const state = this.createDefaultState();
    try {
      const raw = localStorage.getItem('evolution_pebble_save');
      if (raw) {
        const serializable = JSON.parse(raw) as SerializableGameState;
        this.mergeStateFromSerializable(state, serializable);
      }
    } catch {
      // Используем state по умолчанию
    }
    return state;
  }

  private createDefaultState(): GameState {
    return {
      level: 1,
      score: 0,
      clickLevel: 0,
      crowOwned: false,
      crowLevel: 0,
      fortuneLevel: 0,
      fortressLevel: 0,
      lastSave: Date.now(),
      crowDisabledUntil: 0,
      activeEvent: null,
      tutorialCompleted: false,
    };
  }

  private toSerializable(state: GameState): SerializableGameState {
    return {
      level: state.level,
      score: state.score,
      clickLevel: state.clickLevel,
      crowOwned: state.crowOwned,
      crowLevel: state.crowLevel,
      fortuneLevel: state.fortuneLevel,
      fortressLevel: state.fortressLevel,
      lastSave: state.lastSave,
      crowDisabledUntil: state.crowDisabledUntil,
      tutorialCompleted: state.tutorialCompleted,
    };
  }

  private mergeSerializable(data: SerializableGameState): void {
    this.mergeStateFromSerializable(this.state, data);
  }

  private mergeStateFromSerializable(target: GameState, data: SerializableGameState): void {
    target.level = data.level;
    target.score = data.score;
    target.clickLevel = data.clickLevel;
    target.crowOwned = data.crowOwned;
    target.crowLevel = data.crowLevel;
    target.fortuneLevel = data.fortuneLevel;
    target.fortressLevel = data.fortressLevel;
    target.lastSave = data.lastSave;
    target.crowDisabledUntil = data.crowDisabledUntil;
    target.tutorialCompleted = data.tutorialCompleted;
    // activeEvent сбрасывается — события не сохраняются
    target.activeEvent = null;
  }
}
