import { StateManager } from '@core/StateManager';
import { CLICK_BASE_PRICE, CLICK_PRICE_MULTIPLIER, CLICK_BASE_INCOME, CLICK_INCOME_PER_LEVEL } from '@core/config';

/**
 * Менеджер кликов — расчёт дохода и покупка апгрейдов
 * Формула дохода: Очки_за_клик = 1 + clickLevel × 2
 * Формула цены: Цена × 1.4^уровень
 */
export class ClickManager {
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  /**
   * Текущий доход за клик
   */
  getIncome(): number {
    const level = this.stateManager.getClickLevel();
    return CLICK_BASE_INCOME + level * CLICK_INCOME_PER_LEVEL;
  }

  /**
   * Стоимость следующего улучшения клика
   */
  getUpgradeCost(): number {
    const level = this.stateManager.getClickLevel();
    return Math.floor(CLICK_BASE_PRICE * Math.pow(CLICK_PRICE_MULTIPLIER, level));
  }

  /**
   * Покупка улучшения клика
   * @returns true если покупка успешна
   */
  buyUpgrade(): boolean {
    const cost = this.getUpgradeCost();
    if (!this.stateManager.canAfford(cost)) {
      return false;
    }

    const success = this.stateManager.spendScore(cost);
    if (!success) return false;

    const newLevel = this.stateManager.getClickLevel() + 1;
    this.stateManager.setClickLevel(newLevel);

    return true;
  }

  /**
   * Можно ли купить улучшение
   */
  canBuyUpgrade(): boolean {
    return this.stateManager.canAfford(this.getUpgradeCost());
  }
}
