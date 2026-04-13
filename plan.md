# 🗺️ Пошаговый план реализации: «Эволюция Гальки»

**Версия:** 1.0
**Стек:** TypeScript + Phaser 3 + Vite + Yandex Games SDK
**Архитектура:** Модульная (ESM), state-driven, ECS-подобная структура

---

## 🏗️ Фаза 0: Настройка проекта (День 1)

### Задача 0.1 — Инициализация проекта
- [ ] `npm init -y` → настройка `package.json`
- [ ] Установка зависимостей:
  ```bash
  npm install phaser
  npm install -D typescript vite @vitejs/plugin-legacy ts-node @types/node
  ```
- [ ] Создание `tsconfig.json` (strict mode, target ES2022, module ESNext)
- [ ] Создание `vite.config.ts` (output: dist/, base: './', plugins)
- [ ] Создание базовой структуры папок:
  ```
  src/
  ├── core/           # Движок, утилиты, типы
  ├── modules/        # Игровые системы
  ├── ui/             # Phaser сцены UI
  ├── scenes/         # Игровые сцены
  ├── assets/         # Графика, звук (placeholder)
  ├── sdk/            # Обертки Yandex SDK
  └── main.ts         # Entry point
  public/
  └── index.html
  ```

### Задача 0.2 — Базовый конфигурационный модуль
- [ ] `src/core/config.ts` — централизованные константы:
  - `EVOLUTION_MULTIPLIERS: number[]` (12 значений из GDD 2.1)
  - `BASE_EVOLUTION_COST: number` (баланс: 100)
  - `CLICK_BASE_PRICE: number` (10)
  - `CROW_BASE_PRICE: number` (50)
  - `CROW_BASE_INCOME: number` (0.5)
  - `EVENT_CHECK_INTERVAL: number` (45)
  - `MIN_SCORE_FLOOR: number` (50)
- [ ] `src/core/types.ts` — TypeScript интерфейсы:
  ```ts
  interface GameState {
    level: number;           // 1-12 эволюция
    score: number;
    clickLevel: number;
    crowOwned: boolean;
    crowLevel: number;
    fortuneLevel: number;
    fortressLevel: number;
    lastSave: number;
    crowDisabledUntil: number;
    activeEvent: EventData | null;
  }

  interface EventData {
    type: 'storm' | 'wind' | 'rain' | 'hunter' | 'meteorite';
    startedAt: number;
    duration?: number;
    tickInterval?: number;
  }

  interface UpgradeConfig {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    priceMultiplier: number;
    maxLevel: number;
    effect: (level: number) => number;
  }
  ```

### Задача 0.3 — Базовый HTML entry point
- [ ] `public/index.html` — viewport meta, safe-area, отключение zoom
- [ ] `src/main.ts` — инициализация Phaser Game config
- [ ] `vite dev` — проверка hot-reload, запуск сцены

**Критерий готовности:** `npm run dev` открывает пустой Phaser canvas 1280×720, работает hot-reload.

---

## 🎮 Фаза 1: Ядро игрового цикла (Дни 2-4)

### Задача 1.1 — Менеджер состояния (State Manager)
- [ ] `src/core/StateManager.ts`
  - Singleton с реактивными подписками (`onChange` callback)
  - Методы: `addScore(n)`, `spendScore(n)`, `canAfford(n)`, `getScore()`
  - Валидация: score >= 0, level 1-12
  - Автосохранение в `localStorage` каждые 30 сек
  - Эмиттер событий: `EventEmitter` для UI-подписок
- [ ] Unit-тесты: `__tests__/StateManager.test.ts`

### Задача 1.2 — Система кликов
- [ ] `src/modules/ClickManager.ts`
  - Формула: `Очки_за_клик = 1 + clickLevel × 2`
  - Метод `handleClick(): number` — возвращает начисленные очки
  - Анимация: floating text "+X" при клике (tween)
- [ ] `src/scenes/GameScene.ts` — базовая сцена с интерактивным объектом (placeholder: круг/квадрат)
  - Pointer down → `ClickManager.handleClick()` → обновление UI
  - Spring animation при клике

### Задача 1.3 — UI: Счетчик очков
- [ ] `src/ui/ScoreDisplay.ts`
  - Phaser Text object, top-center
  - Форматирование: `1.2K`, `1.5M` для больших чисел
  - Анимация при изменении (scale pulse)
- [ ] Интеграция в `GameScene`

### Задача 1.4 — Система апгрейдов клика
- [ ] `src/modules/UpgradeManager.ts`
  - Формула цены: `Цена × 1.4^уровень`
  - Методы: `buyClickUpgrade()`, `getClickUpgradeCost()`, `getClickLevel()`
  - Валидация: `canAfford()` через StateManager
- [ ] Простой UI для покупки (кнопка в debug-панели)

**Критерий готовности:** Клик по объекту начисляет очки, покупка апгрейда увеличивает доход за клик, UI обновляется, сохранения работают.

---

## 🐦 Фаза 2: Пассивный доход и Ворон (Дни 5-7)

### Задача 2.1 — Менеджер Ворона
- [ ] `src/modules/CrowManager.ts`
  - Формула: `Доход_в_сек = (0.5 + crowLevel × 0.3) × (1 + level × 0.1)`
  - Методы: `buyCrow()`, `upgradeCrow()`, `getPassiveIncome()`, `isCrowDisabled()`
  - Таймер пассивного дохода: `setInterval` каждую секунду → `addScore(income)`
  - Обработка кулдауна (Охотник): `crowDisabledUntil` timestamp
- [ ] Unit-тесты: расчет дохода, кулдаун, покупка

### Задача 2.2 — Оффлайн-доход
- [ ] `src/core/OfflineCalculator.ts`
  - При загрузке: `elapsed = now - lastSave`
  - `offlineIncome = incomePerSec × min(elapsed, MAX_OFFLINE_HOURS × 3600)`
  - Ограничение: макс 4 часа оффлайн-дохода
  - Диалог при загрузке: "Пока вас не было, Ворон заработал X очков"

### Задача 2.3 — UI магазина (базовый)
- [ ] `src/scenes/ShopScene.ts`
  - Вкладки: Клик / Ворон (пока 2, остальные placeholder)
  - Карточки апгрейдов: название, описание, цена, кнопка "Купить"
  - Disabled state если не хватает очков
  - Кнопка "Назад" → возврат в GameScene

**Критерий готовности:** Покупка и прокачка Ворона работают, пассивный доход начисляется, оффлайн-доход рассчитывается корректно.

---

## ⛈️ Фаза 3: Система случайных событий (Дни 8-11)

### Задача 3.1 — Менеджер событий
- [ ] `src/modules/EventManager.ts`
  - Таймер проверки каждые 45-60 сек
  - Таблица вероятностей из GDD (storm 15%, wind 10%, rain 12%, hunter 8%, meteorite 0.1-0.3%)
  - Кулдаун между событиями: 45 сек
  - Не более 1 активного события
  - Проверка условий (Ворон куплен, level ≥ 7)

### Задача 3.2 — Реализация событий
- [ ] `src/modules/events/StormEvent.ts`
  - 1% шанс молнии → `-50% текущих очков`
  - Мгновенный эффект

- [ ] `src/modules/events/WindEvent.ts`
  - Каждые 5 сек: `-5% от текущих очков`
  - Длительность 15-25 сек (рандом)

- [ ] `src/modules/events/RainEvent.ts`
  - Мгновенно: `-10% текущих очков`

- [ ] `src/modules/events/HunterEvent.ts`
  - Ворон ранен → `crowDisabledUntil = now + 3min`
  - Пассивный доход = 0 на duration

- [ ] `src/modules/events/MeteoriteEvent.ts`
  - Только level ≥ 7
  - `-1 уровень эволюции`, `очки = 0`

### Задача 3.3 — Мягкий пол и ограничения потерь
- [ ] `src/core/BalanceGuard.ts`
  - `MIN_SCORE_FLOOR = 50` — очки никогда не падают ниже
  - Формула: `newScore = Math.max(MIN_SCORE_FLOOR, currentScore × (1 - loss))`
  - Счетчик потерь за сессию: если >40% прогресса → временная защита

### Задача 3.4 — UI оверлей событий
- [ ] `src/ui/EventOverlay.ts`
  - Полупрозрачный фон + иконка события
  - Таймер обратного отсчета (для длительных)
  - Описание эффекта
  - Плавное появление/исчезновение (tween)

**Критерий готовности:** Все 5 событий работают с корректными шансами, UI отображает активное событие, мягкий пол защищает прогресс.

---

## 🛡️ Фаза 4: Защитные механики (Дни 12-13)

### Задача 4.1 — Фортуна
- [ ] `src/modules/FortuneManager.ts`
  - Формула: `Шанс_события × (1 - 0.08 × ур.)`
  - Макс 15 уровень → мин. шанс 20% от базового
  - Интеграция в EventManager: умножение вероятностей перед роллом

### Задача 4.2 — Крепость камня
- [ ] `src/modules/FortressManager.ts`
  - Формула: `Потеря × (1 - 0.12 × ур.)`
  - Макс 10 уровень → мин. потеря 30% от базовой
  - Интеграция в BalanceGuard: модификация loss перед применением

### Задача 4.3 — UI защитных апгрейдов
- [ ] Добавление в Shop Scene вкладки "Защита"
- [ ] Карточки Фортуны и Крепости с описанием эффекта
- [ ] Визуальный индикатор текущей защиты (% снижения)

**Критерий готовности:** Покупка защитных навыков снижает шанс/потерю событий согласно формулам GDD.

---

## 🧬 Фаза 5: Эволюция и визуал (Дни 14-20)

### Задача 5.1 — Система эволюции
- [ ] `src/modules/EvolutionManager.ts`
  - Формула: `Стоимость(n) = BASE_EVOLUTION_COST × Множитель^(n-1) × 1.5`
  - Методы: `canEvolve()`, `evolve()`, `getEvolutionCost()`, `getLevelName()`
  - Валидация: level < 12, score >= cost
  - При эволюции: `level++`, сброс части очков (опционально)

### Задача 5.2 — 12 уровней визуала (placeholder → финал)
- [ ] `src/assets/evolution/` — 12 PNG/WebP файлов
  - Этап 1-6: камень растет (scale 0.5 → 2.0)
  - Этап 7-9: фон меняется (градиент неба)
  - Этап 10-12: эпичный фон, частицы (облака, птицы)
- [ ] Placeholder на старте: CSS-формы + градиенты (без арта)
- [ ] `src/modules/VisualManager.ts` — загрузка спрайта по level

### Задача 5.3 — Анимация эволюции
- [ ] `src/ui/EvolutionAnimation.ts`
  - Morph transition: fade out старого → fade in нового
  - Всплывающий текст: "Эволюция! Новый уровень: [Название]"
  - Screen shake + particles (Phaser particle emitter)
  - Блокировка ввода на время анимации (2-3 сек)

### Задача 5.4 — Фоны и окружение
- [ ] `src/assets/backgrounds/` — 4 фона (stage 1-3, 4-6, 7-9, 10-12)
- [ ] Parallax слой (опционально, если вес билда позволяет)
- [ ] Адаптив под 16:9 и 9:16

**Критерий готовности:** Все 12 уровней эволюции доступны, покупка работает, анимация проигрывается, визуал изменяется.

---

## 🔌 Фаза 6: Yandex SDK интеграция (Дни 21-24)

### Задача 6.1 — Обертка SDK
- [ ] `src/sdk/YandexSDK.ts`
  - `init()` → `ysdk.init()` с fallback (local mode)
  - Graceful degradation: если SDK недоступен → console.warn
  - `isSDKReady: boolean` флаг

### Задача 6.2 — Cloud Saves
- [ ] `src/sdk/CloudSaveManager.ts`
  - `save(gameState)` → `ysdk.player.setData()`
  - `load()` → `ysdk.player.getData()` → merge с localStorage
  - Конфликт-резолв: cloud побеждает если `lastSave` новее
  - Fallback: если SDK error → используем localStorage

### Задача 6.3 — Реклама
- [ ] `src/sdk/AdManager.ts`
  - **Rewarded Video:**
    - `showDoubleIncomeAd()` → ×2 доход на 1 час
    - `showCancelEventAd()` → отменить активное событие
    - `showReviveCrowAd()` → убрать кулдаун Ворона
    - `showTripleClickAd()` → ×3 очков за клик на 30 сек
  - **Interstitial:**
    - После эволюции
    - Каждые 5-7 минут (таймер)
    - Мин. интервал 90 сек
  - **Banner:** (опционально) 50×50 внизу, не перекрывает UI

### Задача 6.4 — Лидерборды и аналитика
- [ ] `src/sdk/LeaderboardManager.ts` (опционально)
  - `submitScore(score)` → `ysdk.leaderboards.setLeaderboardScore()`
  - Только эволюция level 12 или по желанию игрока
- [ ] `src/sdk/AnalyticsManager.ts`
  - Отправка событий: `evolution`, `purchase`, `ad_watch`, `session_end`
  - `ysdk.features.LoadingAPI.ready()` при загрузке

**Критерий готовности:** SDK инициализируется, сохранения работают в cloud + fallback, реклама показывается корректно, игра проходит модерацию.

---

## 🎨 Фаза 7: Полировка UI/UX (Дни 25-28)

### Задача 7.1 — Адаптивный интерфейс
- [ ] Safe-area insets для мобильных (notch, home indicator)
- [ ] Touch-optimized кнопки: мин. 44×44 px
- [ ] Отключение double-tap zoom
- [ ] Масштабирование canvas: `ScaleManager` Phaser

### Задача 7.2 — Экран загрузки
- [ ] `src/scenes/BootScene.ts`
  - Прогресс-бар загрузки ассетов
  - Логотип игры
  - Подсказки ("Кликайте по камню, чтобы расти!")

### Задача 7.3 — Пауза и resume
- [ ] Обработка `visibilitychange`, `pause`/`resume` SDK events
- [ ] При сворачивании: `game.loop.pause()`, сохранение
- [ ] При разворачивании: `game.loop.resume()`, recalculations

### Задача 7.4 — Звуковые эффекты (опционально)
- [ ] `src/assets/audio/` — клики, покупка, эволюция, события
- [ ] `src/core/AudioManager.ts` — volume control, mute toggle
- [ ] WebAudio API, сжатие OGG/MP3, общий вес < 500KB

### Задача 7.5 — Туториал
- [ ] `src/ui/TutorialOverlay.ts`
  - 3-4 шага при первом запуске:
    1. "Кликните по камню!"
    2. "Купите улучшение в магазине"
    3. "Следите за событиями!"
  - Сохранение `tutorialCompleted` flag

**Критерий готовности:** Игра адаптирована под мобильные/десктоп, есть загрузка, пауза, туториал, работает стабильно 60 FPS.

---

## 🧪 Фаза 8: Тестирование и баланс (Дни 29-33)

### Задача 8.1 — Unit-тесты
- [ ] Покрытие критичных модулей ≥80%:
  - `StateManager` — сериализация, валидация
  - `ClickManager` — формулы дохода
  - `CrowManager` — пассивный доход, кулдаун
  - `EventManager` — ролл событий, кулдаун
  - `BalanceGuard` — мягкий пол
  - `EvolutionManager` — формулы стоимости
- [ ] `npm run test` — Jest + ts-jest

### Задача 8.2 — Integration тесты
- [ ] Playwright E2E сценарии:
  - Клик → покупка → эволюция → проверка UI
  - Событие → защита → проверка потерь
  - Сохранение → перезагрузка → восстановление состояния

### Задача 8.3 — Playtest раунды (3 итерации)
- [ ] **Раунд 1:** Базовый баланс
  - Замер: время до level 3, частота событий
  - Фикс: если слишком медленно/быстро → корректировка формул
- [ ] **Раунд 2:** Стресс-тест
  - 30 мин непрерывной игры → проверка инфляции
  - Фикс: корректировка `priceMultiplier`, `EVENT_CHECK_INTERVAL`
- [ ] **Раунд 3:** User testing
  - 3-5 тестеров → сбор фидбека
  - Фикс: UI/UX проблемы, непонятные механики

### Задача 8.4 — Оптимизация билда
- [ ] `vite build` → анализ веса (`rollup-plugin-visualizer`)
- [ ] Цель: < 5 МБ (идеал), < 10 МБ (макс)
- [ ] Сжатие ассетов: TinyPNG, WebP, texture atlas
- [ ] Tree-shaking, code splitting, lazy loading сцен

**Критерий готовности:** Все тесты passed, билд < 10 МБ, 3 раунда playtest завершены, баланс стабилен.

---

## 🚀 Фаза 9: Подготовка к публикации (Дни 34-35)

### Задача 9.1 — Чек-лист Яндекс.Игр
- [ ] Размер билда < 10 МБ, загрузка < 3 сек
- [ ] Cloud Saves + localStorage fallback работают
- [ ] Реклама через `ysdk.adv.showFullscreenAdv()`
- [ ] Нет внешних ссылок, forced ads, сбора данных
- [ ] Протестировано: iOS Safari, Android Chrome, Desktop
- [ ] Пауза/resume при сворачивании
- [ ] Экран загрузки, туториал

### Задача 9.2 — Ассеты для каталога
- [ ] Иконка 512×512 PNG
- [ ] 3-5 скриншотов (1280×720)
- [ ] Описание игры (до 4000 символов)
- [ ] Жанр: Кликер / Idle
- [ ] Возрастной рейтинг: 12+

### Задача 9.3 — Финальный билд
- [ ] `npm run build` → production mode, minification
- [ ] Загрузка в черновик Яндекс.Игр
- [ ] Прохождение автоматической проверки
- [ ] Фикс замечаний → resubmit

**Критерий готовности:** Игра загружена в каталог, проходит все проверки Яндекс.Игр.

---

## 📊 Сводная таблица фаз

| Фаза | Дни | Зада | Критический путь |
|------|-----|------|------------------|
| 0. Настройка | 1 | 3 | ✅ Да |
| 1. Ядро | 2-4 | 4 | ✅ Да |
| 2. Ворон | 5-7 | 3 | ✅ Да |
| 3. События | 8-11 | 4 | ✅ Да |
| 4. Защита | 12-13 | 3 | ❌ Нет (параллельно) |
| 5. Эволюция | 14-20 | 4 | ✅ Да |
| 6. SDK | 21-24 | 4 | ✅ Да |
| 7. Полировка | 25-28 | 5 | ❌ Нет |
| 8. Тесты | 29-33 | 4 | ✅ Да |
| 9. Публикация | 34-35 | 3 | ✅ Да |

---

## 🔧 Команды разработки

```bash
# Development server
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Build analysis
npm run analyze
```

---

## ⚠️ Риски и митигация

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Билд > 10 МБ | Средняя | Высокое | Lazy loading, сжатие ассетов, удаление unused code |
| Баланс сломан | Высокая | Среднее | 3 раунда playtest, настраиваемые формулы в config |
| SDK не работает в locale | Низкая | Среднее | Graceful degradation, localStorage fallback |
| Мобильный UX неудобен | Средняя | Высокое | Раннее тестирование на реальных устройствах |
| События слишком агрессивны | Средняя | Высокое | BalanceGuard, настраиваемые шансы в config |

---

## 🎯 Milestones для демонстрации

| Milestone | Что показывает | День |
|-----------|----------------|------|
| **M1: Прототип** | Клик + счетчик + 1 апгрейд | 4 |
| **M2: Экономика** | Ворон + пассивный доход + магазин | 7 |
| **M3: События** | 5 типов событий + UI оверлей | 11 |
| **M4: Полная механика** | Все системы + эволюция (placeholder) | 20 |
| **M5: SDK** | Cloud saves + реклама | 24 |
| **M6: Beta** | Полный контент + тесты + мобильный адаптив | 28 |
| **M7: Release** | Проходит модерацию Яндекс.Игр | 35 |

---

**Готово к началу разработки. Ожидаю подтверждения для старта Фазы 0.**
