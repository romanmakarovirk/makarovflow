# MakarovFlow Bot Server

Telegram бот для запуска MakarovFlow Mini App.

## 🚀 Деплой на Render.com (бесплатно, 24/7)

### Пошаговая инструкция:

1. **Создать аккаунт:**
   - Зайти на https://render.com
   - Зарегистрироваться через GitHub

2. **Создать Git репозиторий:**
   ```bash
   cd /Users/romanmakarov/mindflow-app
   git init
   git add .
   git commit -m "Initial commit"
   ```
   - Создать новый репозиторий на GitHub
   - Запушить код:
   ```bash
   git remote add origin https://github.com/ВАШ_USERNAME/makarovflow.git
   git branch -M main
   git push -u origin main
   ```

3. **Создать Web Service на Render:**
   - Нажать "New +" → "Web Service"
   - Выбрать свой GitHub репозиторий
   - **Root Directory:** `bot-server` (ВАЖНО!)
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

4. **Добавить Environment Variables:**
   - Нажать "Environment" → "Add Environment Variable"
   - Добавить:
     - `BOT_TOKEN` = `8353631022:AAHWAts6QguP9--0S4eWxM1rb0Dr40Cmy2Y`
     - `WEB_APP_URL` = `https://euphonious-belekoy-38aa4b.netlify.app`

5. **Деплой:**
   - Нажать "Create Web Service"
   - Подождать 2-3 минуты
   - Бот автоматически запустится и будет работать 24/7!

## 🔄 Автоматическое обновление

После настройки любой `git push` в репозиторий автоматически обновит бота на Render.

## 📋 Локальный запуск

```bash
cd bot-server
npm install
npm start
```

## 🔧 Переменные окружения

- `BOT_TOKEN` - токен бота от @BotFather (обязательно)
- `WEB_APP_URL` - URL вашего веб-приложения на Netlify (обязательно)

## 📦 Технологии

- [Grammy](https://grammy.dev/) - современный фреймворк для Telegram ботов
- Node.js 18+
