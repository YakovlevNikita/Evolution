import { StateManager } from '@core/StateManager';
import {
  CLICK_BASE_PRICE,
  CLICK_PRICE_MULTIPLIER,
  CROW_BASE_PRICE,
  CROW_UPGRADE_PRICE_MULTIPLIER,
  FORTUNE_MAX_LEVEL,
  FORTRESS_MAX_LEVEL,
} from '@core/config';

/**
 * Типы апгрейдов
 */
export type UpgradeType = 'click' | 'crow' | 'crowUpgrade' | 'fortune' | 'fortress';

/**
 * Информация об апгрейде для UI
 */
export interface UpgradeInfo {
  type: UpgradeType;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  cost: number;
  canAfford: boolean;
  isOwned?: boolean;
}

/**
 * Универсальный менеджер апгрейдов
 * Формулы роста цен:
 *   Клик:      Цена × 1.4^уровень
 *   Ворон:     Фиксированная стартовая цена (покупка) / 1.6^уровень (прокачка)
 *   Защита:    Базовая цена × множитель^уровень
 */
export class UpgradeManager {
  private stateManager: StateManager;

  // Базовые цены для защитных навыков
  private static readonly FORTUNE_BASE_PRICE = 30;
  private static readonly FORTUNE_PRICE_MULTIPLIER = 1.5;
  private static readonly FORTRESS_BASE_PRICE = 40;
  private static readonly FORTRESS_PRICE_MULTIPLIER = 1.5;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  // === Клик ===

  getClickUpgradeCost(): number {
    const level = this.stateManager.getClickLevel();
    return Math.floor(CLICK_BASE_PRICE * Math.pow(CLICK_PRICE_MULTIPLIER, level));
  }

  buyClickUpgrade(): boolean {
    const cost = this.getClickUpgradeCost();
    if (!this.stateManager.canAfford(cost)) return false;

    const success = this.stateManager.spendScore(cost);
    if (!success) return false;

    this.stateManager.setClickLevel(this.stateManager.getClickLevel() + 1);
    return true;
  }

  // === Ворон: покупка ===

  getCrowBuyCost(): number {
    return CROW_BASE_PRICE;
  }

  canBuyCrow(): boolean {
    return !this.stateManager.isCrowOwned() && this.stateManager.canAfford(this.getCrowBuyCost());
  }

  buyCrow(): boolean {
    if (this.stateManager.isCrowOwned()) return false;

    const cost = this.getCrowBuyCost();
    if (!this.stateManager.canAfford(cost)) return false;

    const success = this.stateManager.spendScore(cost);
    if (!success) return false;

    this.stateManager.setCrowOwned(true);
    this.stateManager.setCrowLevel(1);
    return true;
  }

  // === Ворон: прокачка ===

  getCrowUpgradeCost(): number {
    const level = this.stateManager.getCrowLevel();
    return Math.floor(CROW_BASE_PRICE * Math.pow(CROW_UPGRADE_PRICE_MULTIPLIER, level));
  }

  canUpgradeCrow(): boolean {
    return (
      this.stateManager.isCrowOwned() &&
      this.stateManager.getCrowLevel() < 20 &&
      this.stateManager.canAfford(this.getCrowUpgradeCost())
    );
  }

  upgradeCrow(): boolean {
    if (!this.stateManager.isCrowOwned()) return false;
    if (this.stateManager.getCrowLevel() >= 20) return false;

    const cost = this.getCrowUpgradeCost();
    if (!this.stateManager.canAfford(cost)) return false;

    const success = this.stateManager.spendScore(cost);
    if (!success) return false;

    this.stateManager.setCrowLevel(this.stateManager.getCrowLevel() + 1);
    return true;
  }

  // === Фортуна ===

  getFortuneUpgradeCost(): number {
    const level = this.stateManager.getFortuneLevel();
    return Math.floor(UpgradeManager.FORTUNE_BASE_PRICE * Math.pow(UpgradeManager.FORTUNE_PRICE_MULTIPLIER, level));
  }

  canUpgradeFortune(): boolean {
    return (
      this.stateManager.getFortuneLevel() < FORTUNE_MAX_LEVEL &&
      this.stateManager.canAfford(this.getFortuneUpgradeCost())
    );
  }

  upgradeFortune(): boolean {
    if (this.stateManager.getFortuneLevel() >= FORTUNE_MAX_LEVEL) return false;

    const cost = this.getFortuneUpgradeCost();
    if (!this.stateManager.canAfford(cost)) return false;

    const success = this.stateManager.spendScore(cost);
    if (!success) return false;

    this.stateManager.setFortuneLevel(this.stateManager.getFortuneLevel() + 1);
    return true;
  }

  // === Крепость камня ===

  getFortressUpgradeCost(): number {
    const level = this.stateManager.getFortressLevel();
    return Math.floor(UpgradeManager.FORTRESS_BASE_PRICE * Math.pow(UpgradeManager.FORTRESS_PRICE_MULTIPLIER, level));
  }

  canUpgradeFortress(): boolean {
    return (
      this.stateManager.getFortressLevel() < FORTRESS_MAX_LEVEL &&
      this.stateManager.canAfford(this.getFortressUpgradeCost())
    );
  }

  upgradeFortress(): boolean {
    if (this.stateManager.getFortressLevel() >= FORTRESS_MAX_LEVEL) return false;

    const cost = this.getFortressUpgradeCost();
    if (!this.stateManager.canAfford(cost)) return false;

    const success = this.stateManager.spendScore(cost);
    if (!success) return false;

    this.stateManager.setFortressLevel(this.stateManager.getFortressLevel() + 1);
    return true;
  }

  // === UI helpers ===

  /**
   * Получение информации об апгрейде для отображения в магазине
   */
  getUpgradeInfo(type: UpgradeType): UpgradeInfo {
    switch (type) {
      case 'click':
        return {
          type: 'click',
          name: 'Сила клика',
          description: `+2 очка за клик (ур. ${this.stateManager.getClickLevel()})`,
          level: this.stateManager.getClickLevel(),
          maxLevel: Infinity,
          cost: this.getClickUpgradeCost(),
          canAfford: this.stateManager.canAfford(this.getClickUpgradeCost()),
        };

      case 'crow':
        return {
          type: 'crow',
          name: this.stateManager.isCrowOwned() ? 'Ворон (прокачка)' : 'Купить Ворона',
          description: this.stateManager.isCrowOwned()
            ? `Пассивный доход (ур. ${this.stateManager.getCrowLevel()}/20)`
            : 'Пассивный доход каждую секунду',
          level: this.stateManager.getCrowLevel(),
          maxLevel: 20,
          cost: this.stateManager.isCrowOwned() ? this.getCrowUpgradeCost() : this.getCrowBuyCost(),
          canAfford: this.stateManager.isCrowOwned()
            ? this.canUpgradeCrow()
            : this.canBuyCrow(),
          isOwned: this.stateManager.isCrowOwned(),
        };

      case 'fortune':
        return {
          type: 'fortune',
          name: 'Фортуна',
          description: `Снижает шанс событий на ${Math.floor(this.stateManager.getFortuneLevel() * 8)}% (ур. ${this.stateManager.getFortuneLevel()}/${FORTUNE_MAX_LEVEL})`,
          level: this.stateManager.getFortuneLevel(),
          maxLevel: FORTUNE_MAX_LEVEL,
          cost: this.getFortuneUpgradeCost(),
          canAfford: this.canUpgradeFortune(),
        };

      case 'fortress':
        return {
          type: 'fortress',
          name: 'Крепость камня',
          description: `Снижает потерю очков на ${Math.floor(this.stateManager.getFortressLevel() * 12)}% (ур. ${this.stateManager.getFortressLevel()}/${FORTRESS_MAX_LEVEL})`,
          level: this.stateManager.getFortressLevel(),
          maxLevel: FORTRESS_MAX_LEVEL,
          cost: this.getFortressUpgradeCost(),
          canAfford: this.canUpgradeFortress(),
        };

      default:
        throw new Error(`Unknown upgrade type: ${type}`);
    }
  }
}
