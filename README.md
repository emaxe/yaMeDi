# Yandex Metrics Dashboard

Десктопное приложение для работы с данными Яндекс Метрики и Яндекс Директа.

- Счётчики, метрики и графики в одном окне.
- Безопасное хранение OAuth-токена через `safeStorage`.
- Современный стек: Electron + React + TypeScript + Vite + Tailwind CSS + Recharts.
- Кроссплатформенная сборка: macOS (dmg/zip), Windows (nsis/portable), Linux (AppImage/deb).

## Требования

- [Node.js](https://nodejs.org/) 20+ (LTS)
- npm 9+ (устанавливается вместе с Node.js)
- Для сборки релизов в CI — репозиторий на GitHub.

## Установка

```bash
git clone <repository-url>
cd testApp
npm install --no-audit --no-fund
```

## Разработка

Запуск десктопного приложения с горячей перезагрузкой Vite:

```bash
npm run dev
```

Для работы с API потребуется OAuth-токен Яндекса. Введите его в интерфейсе настройки приложения.

## Сборка

Сборка production-версии и создание инсталляторов для текущей платформы:

```bash
npm run build
```

Готовые артефакты появятся в папке `dist/`.

Если `dist/` уже собран, можно только упаковать инсталляторы без публикации:

```bash
npm run dist
```

## Тесты

```bash
npm run test:unit      # unit-тесты Vitest
npm run test:e2e       # сборка + E2E-тесты Playwright
npm run test           # unit + e2e
```

## Линтинг и проверка типов

```bash
npm run lint
npm run typecheck
npm run format
```

## Создание релиза

Релизы собираются и публикуются автоматически через GitHub Actions при пуше тега версии.

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

CI-воркфлоу (`.github/workflows/ci.yml`) сначала прогоняет линтинг, проверку типов и unit-тесты, а затем параллельно собирает артефакты для macOS, Windows и Linux и прикрепляет их к GitHub Release.

### Требования к токену для релизов

Для публикации GitHub Release используется встроенный `GITHUB_TOKEN`, который предоставляется Actions автоматически. Дополнительная настройка не требуется, если в репозитории включены стандартные разрешения для workflow.

Перед публикацией обновите поле `repository` в `package.json`, чтобы оно указывало на реальный GitHub-репозиторий проекта.

## Структура проекта

```
testApp/
├── electron/              # main + preload процессы Electron
├── src/
│   ├── api/               # клиенты API
│   ├── components/        # React-компоненты
│   ├── types/             # TypeScript-типы
│   ├── App.tsx            # корневой компонент
│   └── main.tsx           # точка входа рендерера
├── e2e/                   # Playwright E2E-тесты
├── public/                # иконки и статические ресурсы
├── index.html
├── vite.config.ts
├── electron-builder.yml
├── playwright.config.ts
├── vitest.config.ts
└── package.json
```

## Лицензия

[MIT](./LICENSE)
