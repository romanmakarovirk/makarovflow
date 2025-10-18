# 🚀 Полная инструкция по развёртыванию MindFlow 24/7

## 📋 Что нужно сделать

1. **Создать PostgreSQL базу данных на Neon.tech** (5 минут)
2. **Задеплоить Backend API на Fly.io** (10 минут)
3. **Задеплоить Telegram бота на Fly.io** (5 минут)
4. **Обновить веб-приложение** (уже на Netlify)

---

## 1️⃣ Создание базы данных на Neon.tech

### Шаг 1: Регистрация
1. Перейди на https://neon.tech
2. Нажми "Sign up" -> войди через GitHub
3. Создай новый проект: "mindflow-db"
4. Регион выбери: **Europe (Frankfurt)** - ближе к нам

### Шаг 2: Получи строку подключения
1. В панели Neon.tech найди раздел "Connection string"
2. Скопируй строку вида:
   ```
   postgres://username:password@ep-xxx.eu-central-1.aws.neon.tech/neondb
   ```
3. **СОХРАНИ ЭТУ СТРОКУ** - она нужна для API сервера!

### Шаг 3: Создай таблицы
1. В Neon.tech открой раздел "SQL Editor"
2. Скопируй весь файл `database/schema.sql`
3. Вставь в SQL Editor и нажми "Run"
4. Проверь что создались таблицы: users, journal_entries, tasks, homework, etc.

---

## 2️⃣ Развёртывание Backend API на Fly.io

### Шаг 1: Установи Fly CLI
```bash
# macOS
brew install flyctl

# Или скачай с https://fly.io/docs/hands-on/install-flyctl/
```

### Шаг 2: Войди в Fly.io
```bash
flyctl auth login
```

### Шаг 3: Создай приложение API
```bash
cd api-server
flyctl launch --name mindflow-api --region fra --no-deploy
```

### Шаг 4: Установи переменные окружения
```bash
# Замени DATABASE_URL на твою строку подключения из Neon.tech!
flyctl secrets set DATABASE_URL="postgres://username:password@ep-xxx.eu-central-1.aws.neon.tech/neondb"

# JWT секрет (любая длинная строка)
flyctl secrets set JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"

# Telegram Bot Token (получи от @BotFather)
flyctl secrets set TELEGRAM_BOT_TOKEN="your-bot-token"
```

### Шаг 5: Задеплой API
```bash
flyctl deploy
```

### Шаг 6: Проверь что работает
```bash
flyctl status
flyctl logs
```

Твой API будет доступен на: `https://mindflow-api.fly.dev`

---

## 3️⃣ Развёртывание Telegram бота на Fly.io

### Шаг 1: Создай приложение для бота
```bash
cd ../bot-server
flyctl launch --name mindflow-bot --region fra --no-deploy
```

### Шаг 2: Установи переменные окружения
```bash
# Telegram Bot Token
flyctl secrets set TELEGRAM_BOT_TOKEN="your-bot-token-from-botfather"

# URL твоего API сервера
flyctl secrets set API_URL="https://mindflow-api.fly.dev"

# URL веб-приложения
flyctl secrets set WEB_APP_URL="https://superlative-gelato-2ffbac.netlify.app"
```

### Шаг 3: Задеплой бота
```bash
flyctl deploy
```

### Шаг 4: Проверь что бот работает
```bash
flyctl logs
```

Напиши боту `/start` в Telegram - должен ответить!

---

## 4️⃣ Обновление веб-приложения

### Добавь API URL в переменные окружения Netlify:

1. Перейди на https://app.netlify.com
2. Открой свой проект "superlative-gelato-2ffbac"
3. Settings -> Environment variables
4. Добавь переменную:
   - Key: `VITE_API_URL`
   - Value: `https://mindflow-api.fly.dev`
5. Нажми "Save"
6. Site configuration -> Deploys -> Trigger deploy -> Clear cache and deploy

---

## 🎉 Готово!

Теперь у тебя:
- ✅ Веб-приложение на Netlify (работает 24/7)
- ✅ База данных на Neon.tech (работает 24/7)
- ✅ Backend API на Fly.io (работает 24/7)
- ✅ Telegram бот на Fly.io (работает 24/7)

Всё работает **даже когда твой компьютер выключен**!

---

## 🔍 Как проверить что всё работает

### 1. Проверка API
```bash
curl https://mindflow-api.fly.dev/health
# Должно вернуть: {"status":"ok"}
```

### 2. Проверка бота
1. Открой Telegram
2. Найди своего бота
3. Напиши `/start`
4. Бот должен ответить с кнопкой "Открыть приложение"

### 3. Проверка веб-приложения
1. Открой https://superlative-gelato-2ffbac.netlify.app
2. Должна появиться кнопка "Войти через Telegram"
3. После входа - все данные сохраняются на сервер

---

## 📊 Мониторинг

### Логи API сервера:
```bash
cd api-server
flyctl logs
```

### Логи бота:
```bash
cd bot-server
flyctl logs
```

### Статус приложений:
```bash
flyctl status --app mindflow-api
flyctl status --app mindflow-bot
```

---

## 💰 Стоимость

- **Neon.tech**: Бесплатно (до 3GB)
- **Fly.io**: Бесплатно (до 3 приложений по 256MB RAM)
- **Netlify**: Бесплатно (100GB трафика/месяц)

**Итого: $0/месяц** 🎊

---

## 🆘 Если что-то не работает

### API не запускается:
```bash
cd api-server
flyctl logs
# Проверь что DATABASE_URL правильный
```

### Бот не отвечает:
```bash
cd bot-server
flyctl logs
# Проверь TELEGRAM_BOT_TOKEN
```

### База данных не подключается:
1. Проверь строку подключения в Neon.tech
2. Убедись что в конце есть `?sslmode=require`
3. Проверь что ты запустил schema.sql

---

## 📝 Полезные команды

```bash
# Перезапустить API
cd api-server && flyctl deploy

# Перезапустить бота
cd bot-server && flyctl deploy

# Обновить environment variables
flyctl secrets set KEY=VALUE

# Открыть дашборд Fly.io
flyctl dashboard

# SSH в контейнер (для отладки)
flyctl ssh console
```

Удачи! 🚀
