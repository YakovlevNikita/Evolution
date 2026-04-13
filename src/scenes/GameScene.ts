import Phaser from 'phaser';

/**
 * Главная игровая сцена — клик по камню, отображение очков, кнопка магазина
 * Placeholder для Фазы 1
 */
export class GameScene extends Phaser.Scene {
  private score: number = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private pebble?: Phaser.GameObjects.Container;
  private shopButton?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Placeholder камня (круг)
    this.pebble = this.add.container(width / 2, height / 2 - 40);

    const pebbleGraphics = this.add.graphics();
    pebbleGraphics.fillStyle(0x808080, 1);
    pebbleGraphics.fillCircle(0, 0, 60);
    pebbleGraphics.lineStyle(2, 0x666666, 1);
    pebbleGraphics.strokeCircle(0, 0, 60);

    this.pebble.add(pebbleGraphics);
    this.pebble.setSize(120, 120);
    this.pebble.setInteractive({ useHandCursor: true });

    // Обработка клика
    this.pebble.on('pointerdown', () => {
      this.handlePebbleClick();
    });

    // Счетчик очков
    this.scoreText = this.add.text(width / 2, 60, 'Очки: 0', {
      fontSize: '36px',
      fontFamily: 'Arial, sans-serif',
      color: '#e0e0e0',
    }).setOrigin(0.5);

    // Кнопка магазина
    this.shopButton = this.add.text(width - 120, 60, '🛒 Магазин', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#4ecca3',
      backgroundColor: '#333355',
      padding: { x: 15, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('ShopScene');
      })
      .on('pointerover', () => {
        this.shopButton?.setScale(1.05);
      })
      .on('pointerout', () => {
        this.shopButton?.setScale(1);
      });

    // Debug: информация
    this.add.text(20, height - 30, 'Фаза 0 — Прототип', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#555555',
    });
  }

  /**
   * Обработка клика по камню
   */
  private handlePebbleClick(): void {
    this.score += 1;
    this.updateScoreDisplay();

    // Анимация пружинки
    if (this.pebble) {
      this.tweens.add({
        targets: this.pebble,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 50,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });
    }

    // Floating text "+1"
    this.showFloatingText('+1', this.input.activePointer?.x ?? 0, this.input.activePointer?.y ?? 0);
  }

  /**
   * Обновление отображения очков
   */
  private updateScoreDisplay(): void {
    if (this.scoreText) {
      this.scoreText.setText(`Очки: ${this.formatNumber(this.score)}`);

      // Pulse анимация
      this.tweens.add({
        targets: this.scoreText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });
    }
  }

  /**
   * Показ всплывающего текста при клике
   */
  private showFloatingText(text: string, x: number, y: number): void {
    const floatingText = this.add.text(x, y, text, {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#4ecca3',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: floatingText,
      y: y - 80,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        floatingText.destroy();
      },
    });
  }

  /**
   * Форматирование больших чисел
   */
  private formatNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  }
}
