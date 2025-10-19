# 🚀 Быстрый деплой на GitHub Pages (2 минуты)

## Шаг 1: Включи GitHub Pages

1. Открой https://github.com/romanmakarovirk/makarovflow/settings/pages
2. В разделе "Build and deployment":
   - Source: выбери **GitHub Actions**
3. Готово!

## Шаг 2: Создай workflow файл

1. Открой https://github.com/romanmakarovirk/makarovflow/new/main?filename=.github/workflows/deploy.yml
2. Скопируй этот код:

\`\`\`yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:
          VITE_OPENROUTER_API_KEY: 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
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
\`\`\`

3. Нажми **Commit changes**
4. Готово!

## Шаг 3: Подожди ~2 минуты

GitHub автоматически:
- Соберёт проект
- Задеплоит на GitHub Pages
- Ты увидишь прогресс здесь: https://github.com/romanmakarovirk/makarovflow/actions

## 🎉 Результат

Твоё приложение будет доступно по адресу:
**https://romanmakarovirk.github.io/makarovflow/**

## 📱 Обновление в боте Telegram

После деплоя обнови URL в своём боте на:
\`https://romanmakarovirk.github.io/makarovflow/\`

---

## ✅ Плюсы GitHub Pages

- ✅ Полностью бесплатно
- ✅ Автодеплой при каждом push в main
- ✅ Быстрый и надёжный
- ✅ SSL сертификат включён
- ✅ Не требует дополнительных регистраций

---

## 🔄 Как это работает

1. Ты пушишь код в main → GitHub автоматически деплоит
2. Все твои изменения автоматически попадают на сайт
3. AI ключ включён в workflow - всё работает из коробки

---

**P.S.** Я уже подготовил workflow файл локально (`.github/workflows/deploy.yml`),
но GitHub не даёт пушить workflow через API. Поэтому нужно создать его вручную
один раз через веб-интерфейс (см. Шаг 2 выше).
