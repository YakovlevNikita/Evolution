import Phaser from 'phaser';

/**
 * Загрузочная сцена — отображает прогресс-бар загрузки ассетов
 * В будущем здесь будет загрузка текстур, звука и инициализация SDK
 */
export class BootScene extends Phaser.Scene {
  private progressBar?: Phaser.GameObjects.Graphics;
  private progressText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Логотип/название
    this.add.text(width / 2, height / 2 - 80, 'Эволюция Гальки', {
      fontSize: '48px',
      fontFamily: 'Arial, sans-serif',
      color: '#e0e0e0',
    }).setOrigin(0.5);

    // Подсказка
    this.add.text(width / 2, height / 2 + 120, 'Кликайте по камню, чтобы расти!', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
    }).setOrigin(0.5);

    // Прогресс-бар
    const barWidth = 400;
    const barHeight = 20;
    const barX = width / 2 - barWidth / 2;
    const barY = height / 2 + 40;

    this.progressBar = this.add.graphics();
    this.progressText = this.add.text(width / 2, barY + 30, '0%', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Placeholder для фона прогресс-бара
    this.progressBar.fillStyle(0x333355);
    this.progressBar.fillRect(barX, barY, barWidth, barHeight);

    // События загрузки
    this.load.on('progress', (value: number) => {
      if (!this.progressBar || !this.progressText) return;

      this.progressBar.clear();

      // Фон
      this.progressBar.fillStyle(0x333355);
      this.progressBar.fillRect(barX, barY, barWidth, barHeight);

      // Прогресс
      this.progressBar.fillStyle(0x4ecca3);
      this.progressBar.fillRect(barX, barY, barWidth * value, barHeight);

      // Текст
      this.progressText.setText(`${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      this.time.delayedCall(500, () => {
        this.scene.start('GameScene');
      });
    });

    // Заглушка — загружаем "ничего" для демонстрации
    this.load.once('complete', () => {});
    this.load.start();
  }

  create(): void {
    // Автопереход если нет ассетов для загрузки
    this.time.delayedCall(800, () => {
      this.scene.start('GameScene');
    });
  }
}
