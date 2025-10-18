# 🚀 Развёртывание MindFlow на Render.com (БЕЗ КАРТЫ!)

## ✅ Что уже готово:
- База данных на Neon.tech (все таблицы созданы)
- Backend API код готов
- Telegram бот готов
- Веб-приложение на Netlify

---

## 📝 Пошаговая инструкция

### 1️⃣ Загрузить код на GitHub

Код уже в Git репозитории. Нужно только закоммитить и запушить:

\`\`\`bash
cd /Users/romanmakarov/mindflow-app
git add .
git commit -m "Add backend API and Telegram bot"
git push origin main
\`\`\`

### 2️⃣ Развернуть Backend API на Render.com

1. Перейди на https://render.com
2. Нажми **"Get Started"** → Войди через **GitHub**
3. Нажми **"New +"** → **"Web Service"**
4. Выбери свой репозиторий \`mindflow-app\`
5. Настройки:
   - **Name**: \`mindflow-api\`
   - **Region**: \`Frankfurt (EU Central)\`
   - **Branch**: \`main\`
   - **Root Directory**: \`api-server\`
   - **Runtime**: \`Node\`
   - **Build Command**: \`npm install\`
   - **Start Command**: \`node server.js\`
   - **Instance Type**: \`Free\`

6. **Environment Variables** (добавь эти переменные):
   \`\`\`
   DATABASE_URL = postgresql://neondb_owner:npg_MRQwX1ByEA3z@ep-winter-thunder-ag7de0em-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require

   JWT_SECRET = mindflow-super-secret-jwt-key-2024-production-v1

   TELEGRAM_BOT_TOKEN = (получи от @BotFather)
   \`\`\`

7. Нажми **"Create Web Service"**
8. Дождись деплоя (2-3 минуты)
9. Скопируй URL (будет типа \`https://mindflow-api.onrender.com\`)

---

### 3️⃣ Развернуть Telegram бота на Render.com

1. Снова нажми **"New +"** → **"Web Service"**
2. Выбери репозиторий \`mindflow-app\`
3. Настройки:
   - **Name**: \`mindflow-bot\`
   - **Region**: \`Frankfurt (EU Central)\`
   - **Branch**: \`main\`
   - **Root Directory**: \`bot-server\`
   - **Runtime**: \`Node\`
   - **Build Command**: \`npm install\`
   - **Start Command**: \`node index.js\`
   - **Instance Type**: \`Free\`

4. **Environment Variables**:
   \`\`\`
   TELEGRAM_BOT_TOKEN = (твой токен от @BotFather)

   API_URL = https://mindflow-api.onrender.com

   WEB_APP_URL = https://superlative-gelato-2ffbac.netlify.app
   \`\`\`

5. Нажми **"Create Web Service"**
6. Дождись деплоя

---

### 4️⃣ Обновить веб-приложение на Netlify

1. Перейди на https://app.netlify.com
2. Открой проект \`superlative-gelato-2ffbac\`
3. **Site configuration** → **Environment variables**
4. Добавь переменную:
   \`\`\`
   VITE_API_URL = https://mindflow-api.onrender.com
   \`\`\`
5. **Deploys** → **Trigger deploy** → **Clear cache and deploy**

---

## 🎉 Готово!

После деплоя:
- ✅ API будет доступен 24/7 на \`https://mindflow-api.onrender.com\`
- ✅ Бот будет работать 24/7
- ✅ Веб-приложение подключено к API

**Всё БЕСПЛАТНО, карта НЕ нужна!**

---

## 💡 Telegram Bot Token

Если ещё не создал бота:

1. Напиши **@BotFather** в Telegram
2. Отправь \`/newbot\`
3. Придумай имя: \`MindFlow\`
4. Придумай username: \`mindflow_bot\` (или любой свободный)
5. Скопируй токен (выглядит как \`1234567890:ABCdef...\`)
6. Используй этот токен в переменных окружения
