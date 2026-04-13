import Phaser from 'phaser';
import { StateManager } from '@core/StateManager';
import { UpgradeManager, type UpgradeType } from '@modules/UpgradeManager';

/**
 * Сцена магазина — вкладки: Клик / Ворон / Защита
 */
export class ShopScene extends Phaser.Scene {
  private stateManager!: StateManager;
  private upgradeManager!: UpgradeManager;
  private tabButtons: Phaser.GameObjects.Text[] = [];
  private upgradeCards: Phaser.GameObjects.Container[] = [];
  private currentTab: UpgradeType[] = ['click'];
  private activeTabLabel = 'Клик';

  constructor() {
    super({ key: 'ShopScene' });
  }

  init(): void {
    this.stateManager = StateManager.getInstance();
    this.upgradeManager = new UpgradeManager(this.stateManager);
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x16213e);

    // Заголовок
    this.add.text(width / 2, 50, 'Магазин', {
      fontSize: '36px',
      fontFamily: 'Arial, sans-serif',
      color: '#e0e0e0',
    }).setOrigin(0.5);

    // Кнопка назад
    this.add.text(100, 50, 'Назад', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#4ecca3',
      backgroundColor: '#333355',
      padding: { x: 15, y: 8 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('GameScene');
      });

    // Вкладки
    this.createTabs(width / 2, 110);

    // Карточки апгрейдов
    this.renderUpgrades(width / 2, 300);
  }

  /**
   * Создание вкладок
   */
  private createTabs(x: number, y: number): void {
    const tabs: { label: string; types: UpgradeType[] }[] = [
      { label: 'Клик', types: ['click'] },
      { label: 'Ворон', types: ['crow'] },
      { label: 'Защита', types: ['fortune', 'fortress'] },
    ];

    const tabWidth = 140;
    const gap = 10;
    const totalWidth = tabs.length * tabWidth + (tabs.length - 1) * gap;
    let startX = x - totalWidth / 2 + tabWidth / 2;

    tabs.forEach((tab, index) => {
      const btn = this.add.text(startX + index * (tabWidth + gap), y, tab.label, {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#aaaaaa',
        backgroundColor: '#2a2a4a',
        padding: { x: 20, y: 8 },
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.currentTab = tab.types;
          this.activeTabLabel = tab.label;
          this.updateTabStyles();
          this.renderUpgrades(this.cameras.main.width / 2, 300);
        });

      this.tabButtons.push(btn);
    });

    this.updateTabStyles();
  }

  /**
   * Обновление стилей вкладок
   */
  private updateTabStyles(): void {
    this.tabButtons.forEach((btn) => {
      const isActive = btn.text === this.activeTabLabel;
      btn.setStyle({
        color: isActive ? '#4ecca3' : '#aaaaaa',
        backgroundColor: isActive ? '#333355' : '#2a2a4a',
      });
    });
  }

  /**
   * Отрисовка карточек апгрейдов
   */
  private renderUpgrades(centerX: number, startY: number): void {
    // Удаляем старые карточки
    this.upgradeCards.forEach((card) => card.destroy());
    this.upgradeCards = [];

    const upgrades: UpgradeType[] = [...this.currentTab];
    const cardWidth = 350;
    const cardHeight = 80;
    const gap = 15;

    upgrades.forEach((type, index) => {
      const info = this.upgradeManager.getUpgradeInfo(type);
      const y = startY + index * (cardHeight + gap);
      const card = this.createUpgradeCard(centerX, y, cardWidth, cardHeight, info);
      this.upgradeCards.push(card);
    });
  }

  /**
   * Создание карточки апгрейда
   */
  private createUpgradeCard(
    x: number,
    y: number,
    width: number,
    height: number,
    info: ReturnType<UpgradeManager['getUpgradeInfo']>
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Фон карточки
    const bg = this.add.rectangle(0, 0, width, height, info.canAfford ? 0x2a2a4a : 0x1a1a2e);
    bg.setStrokeStyle(2, info.canAfford ? 0x4ecca3 : 0x333333);
    container.add(bg);

    // Название
    const nameText = this.add.text(-width / 2 + 15, -height / 2 + 10, info.name, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#e0e0e0',
    });
    container.add(nameText);

    // Описание
    const descText = this.add.text(-width / 2 + 15, -height / 2 + 35, info.description, {
      fontSize: '13px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
    });
    container.add(descText);

    // Цена
    const priceText = this.add.text(-width / 2 + 15, height / 2 - 25, `Цена: ${info.cost}`, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: info.canAfford ? '#4ecca3' : '#ff6b6b',
    });
    container.add(priceText);

    // Кнопка покупки
    const buyBtn = this.add.text(width / 2 - 70, 0, info.isOwned === false ? 'Купить' : 'Улучшить', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: info.canAfford ? '#1a1a2e' : '#555555',
      backgroundColor: info.canAfford ? '#4ecca3' : '#333333',
      padding: { x: 15, y: 8 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: !info.canAfford });

    if (info.canAfford) {
      buyBtn.on('pointerdown', () => {
        this.handlePurchase(info.type);
      });
      buyBtn.on('pointerover', () => buyBtn.setScale(1.05));
      buyBtn.on('pointerout', () => buyBtn.setScale(1));
    }

    container.add(buyBtn);

    return container;
  }

  /**
   * Обработка покупки
   */
  private handlePurchase(type: UpgradeType): void {
    let success = false;

    switch (type) {
      case 'click':
        success = this.upgradeManager.buyClickUpgrade();
        break;
      case 'crow':
        if (this.stateManager.isCrowOwned()) {
          success = this.upgradeManager.upgradeCrow();
        } else {
          success = this.upgradeManager.buyCrow();
        }
        break;
      case 'fortune':
        success = this.upgradeManager.upgradeFortune();
        break;
      case 'fortress':
        success = this.upgradeManager.upgradeFortress();
        break;
    }

    if (success) {
      this.stateManager.save();
      this.renderUpgrades(this.cameras.main.width / 2, 300);
    }
  }
}
