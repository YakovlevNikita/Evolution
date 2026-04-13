import Phaser from 'phaser';

/**
 * Сцена магазина — заглушка для Фазы 1
 * В будущем: вкладки Клик / Ворон / Эволюция / Защита
 */
export class ShopScene extends Phaser.Scene {
  private backButton?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'ShopScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x16213e);

    // Заголовок
    this.add.text(width / 2, 60, '🛒 Магазин', {
      fontSize: '36px',
      fontFamily: 'Arial, sans-serif',
      color: '#e0e0e0',
    }).setOrigin(0.5);

    // Placeholder сообщение
    this.add.text(width / 2, height / 2, 'Магазин в разработке\nФаза 1: Клик / Фаза 2: Ворон', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
      align: 'center',
    }).setOrigin(0.5);

    // Кнопка назад
    this.backButton = this.add.text(120, 60, '← Назад', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#4ecca3',
      backgroundColor: '#333355',
      padding: { x: 15, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('GameScene');
      })
      .on('pointerover', () => {
        this.backButton?.setScale(1.05);
      })
      .on('pointerout', () => {
        this.backButton?.setScale(1);
      });
  }
}
