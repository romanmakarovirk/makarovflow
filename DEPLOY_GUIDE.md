# 🚀 Простая инструкция по деплою MakarovFlow

Следуй этим шагам по порядку. Это займёт ~15 минут.

## ✅ Что уже готово:

- ✅ Приложение собрано и работает на Netlify
- ✅ Бот работает локально
- ✅ Весь код готов к деплою

## 📋 Что нужно сделать:

### Шаг 1: Создать GitHub репозиторий (5 минут)

1. Зайди на https://github.com
2. Нажми кнопку "+" в правом верхнем углу
3. Выбери "New repository"
4. Заполни:
   - **Repository name:** `makarovflow`
   - **Description:** `MakarovFlow - Telegram Mini App для дневника и учёбы`
   - **Privacy:** Public (или Private - на твой выбор)
   - **НЕ** ставь галочки "Initialize with README" и другие
5. Нажми "Create repository"
6. Скопируй URL репозитория (будет вида `https://github.com/ВАШ_USERNAME/makarovflow.git`)

### Шаг 2: Запушить код на GitHub

Открой Terminal (там где у тебя сейчас работает проект) и выполни команды:

```bash
# Перейди в папку проекта
cd /Users/romanmakarov/mindflow-app

# Добавь все файлы
git add .

# Создай коммит
git commit -m "Initial commit: MakarovFlow Telegram Mini App"

# Добавь GitHub репозиторий (замени URL на свой!)
git remote add origin https://github.com/ВАШ_USERNAME/makarovflow.git

# Запушь код
git push -u origin main
```

Если попросит ввести логин и пароль GitHub:
- Логин: твой GitHub username
- Пароль: используй Personal Access Token (не пароль от аккаунта!)

**Как получить токен:**
1. GitHub → Settings (в правом верхнем углу)
2. Developer settings → Personal access tokens → Tokens (classic)
3. Generate new token → Classic
4. Выбери scope: `repo` (полный доступ к репозиториям)
5. Скопируй токен и используй вместо пароля

### Шаг 3: Задеплоить бот на Render.com (5 минут)

1. Зайди на https://render.com
2. Нажми "Get Started" → зарегистрируйся через GitHub
3. Нажми "New +" → "Web Service"
4. Нажми "Connect a repository" → найди `makarovflow`
5. Настройки:
   ```
   Name: makarovflow-bot
   Region: Frankfurt
   Branch: main
   Root Directory: bot-server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```
6. Нажми "Advanced" → "Add Environment Variable":
   ```
   BOT_TOKEN = 8353631022:AAHWAts6QguP9--0S4eWxM1rb0Dr40Cmy2Y
   WEB_APP_URL = https://superlative-gelato-2ffbac.netlify.app
   ```
7. Нажми "Create Web Service"
8. Жди 2-3 минуты пока деплой завершится

**✅ Готово!** Бот теперь работает 24/7!

### Шаг 4: Настроить Telegram Stars для оплаты (опционально, 3 минуты)

1. Открой Telegram → найди @BotFather
2. Отправь `/mybots`
3. Выбери @makarovflow_bot
4. Bot Settings → Payments
5. Выбери "Telegram Stars"
6. Готово! Теперь можно принимать платежи

### Шаг 5: Настроить базу данных Supabase (опционально, 10 минут)

1. Зайди на https://supabase.com
2. Нажми "Start your project"
3. Зарегистрируйся через GitHub
4. Создай новый проект:
   ```
   Name: makarovflow
   Database Password: (придумай надёжный пароль)
   Region: Frankfurt
   ```
5. Подожди 2-3 минуты пока база создаётся
6. Зайди в SQL Editor (слева)
7. Скопируй и выполни SQL из файла `docs/DATABASE.md` (раздел "Создать таблицы")
8. Зайди в Settings → API
9. Скопируй:
   - Project URL
   - anon public key
10. Создай файл `.env` в корне проекта:
    ```
    VITE_SUPABASE_URL=твой-project-url
    VITE_SUPABASE_ANON_KEY=твой-anon-key
    ```

## 🎉 Всё готово!

Твой бот теперь:
- ✅ Работает 24/7 на Render.com
- ✅ Автоматически обновляется при git push
- ✅ Готов принимать платежи через Telegram Stars
- ✅ Может сохранять данные в облако (если настроил Supabase)

## 🆘 Если что-то не работает:

### Проблема: Бот не отвечает
**Решение:** Проверь логи на Render.com:
1. Зайди на render.com
2. Выбери свой сервис makarovflow-bot
3. Открой вкладку "Logs"
4. Посмотри, нет ли ошибок

### Проблема: Git push не работает
**Решение:**
1. Убедись что создал Personal Access Token
2. Используй токен вместо пароля
3. Если не работает - попробуй через GitHub Desktop (проще):
   - Скачай https://desktop.github.com
   - Открой папку проекта
   - Нажми Commit → Push

### Проблема: Ошибка при деплое на Render
**Решение:**
1. Проверь что указал правильный Root Directory: `bot-server`
2. Проверь что добавил переменные окружения
3. Посмотри логи деплоя

## 📱 Контакты для помощи:

Если совсем не получается - напиши мне, помогу!
