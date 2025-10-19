# 🚀 Инструкция по деплою MindFlow v1.0.2

## ✅ Что уже сделано

1. ✅ Исправлен баг сохранения расписания
2. ✅ Интегрирован настоящий AI (OpenRouter + Claude 3.5 Sonnet)
3. ✅ Переделано нижнее меню навигации
4. ✅ Обновлена версия на 1.0.2
5. ✅ Код запушен в GitHub: https://github.com/romanmakarovirk/makarovflow
6. ✅ API ключ настроен в Netlify environment variables
7. ✅ Проект собран (готов к деплою)

## ⚠️ Проблема с Netlify

Твой текущий Netlify аккаунт заблокирован из-за превышения лимитов:
```
Account credit usage exceeded - new deploys are blocked until credits are added
```

## 🎯 Варианты деплоя

### Вариант 1: Апгрейд Netlify (Самый простой)

1. Зайди на https://app.netlify.com/projects/superlative-gelato-2ffbac
2. Перейди в Billing
3. Добавь кредиты или апгрейдни план
4. После этого автоматически задеплоится новая версия из GitHub

**Плюсы**: Всё уже настроено, просто добавь кредиты
**Минусы**: Нужно платить

---

### Вариант 2: Render.com (Рекомендую)

**Бесплатный тариф с хорошими лимитами**

1. Зайди на https://render.com
2. Зарегистрируйся (можно через GitHub)
3. Нажми "New +" → "Static Site"
4. Подключи репозиторий: `romanmakarovirk/makarovflow`
5. Render автоматически найдёт `render.yaml` и настроит всё
6. Нажми "Create Static Site"
7. Готово! Render задеплоит автоматически

**Плюсы**: Бесплатно, автодеплой из GitHub, хорошие лимиты
**Минусы**: Нет

---

### Вариант 3: Vercel (Тоже отличный вариант)

**Щедрый бесплатный тариф**

1. Зайди на https://vercel.com
2. Зарегистрируйся через GitHub
3. Импортируй проект: `romanmakarovirk/makarovflow`
4. Vercel автоматически найдёт настройки Vite
5. **ВАЖНО**: Добавь переменную окружения:
   - Key: `VITE_OPENROUTER_API_KEY`
   - Value: `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`
6. Нажми "Deploy"
7. Готово!

**Плюсы**: Бесплатно, быстрый, отличная производительность
**Минусы**: Нужно вручную добавить API ключ

---

### Вариант 4: GitHub Pages (Бесплатно)

1. В настройках репозитория GitHub
2. Settings → Pages
3. Source: GitHub Actions
4. Создай файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
        env:
          VITE_OPENROUTER_API_KEY: ${{ secrets.VITE_OPENROUTER_API_KEY }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

5. Добавь секрет в GitHub:
   - Settings → Secrets → New repository secret
   - Name: `VITE_OPENROUTER_API_KEY`
   - Value: `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`

**Плюсы**: Полностью бесплатно
**Минусы**: Немного сложнее настроить

---

## 🎉 Рекомендация

**Я рекомендую Render.com** - он:
- Полностью бесплатный
- Автоматически деплоится из GitHub
- Уже настроен (`render.yaml` создан)
- Просто подключи репозиторий и всё!

Просто зайди на https://render.com и подключи свой GitHub репозиторий.

---

## 📱 После деплоя

1. Получишь новый URL (например, `mindflow-app.onrender.com`)
2. Обнови URL в боте Telegram
3. Протестируй:
   - Расписание (должно сохраняться)
   - AI чат (должен отвечать умно)
   - Новую навигацию

---

## ❓ Вопросы?

Весь код готов, собран и запушен в GitHub. Осталось только выбрать платформу для хостинга и задеплоить!
