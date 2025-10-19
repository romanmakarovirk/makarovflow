# 🚀 Быстрый старт - MakarovFlow

## 📋 Краткая шпаргалка для разработчика

### Основные ссылки

| Сервис | URL | Назначение |
|--------|-----|------------|
| **Приложение** | https://superlative-gelato-2ffbac.netlify.app | Frontend Telegram Mini App |
| **Бот** | https://t.me/makarovflow_bot | Telegram бот |
| **Бот сервер** | https://mindflow-bot-5hph.onrender.com | Backend для бота |
| **Netlify** | https://app.netlify.com | Деплой frontend |
| **Render** | https://dashboard.render.com | Деплой бота |
| **UptimeRobot** | https://uptimerobot.com | Мониторинг бота |
| **GitHub** | https://github.com/romanmakarovirk/makarovflow | Репозиторий |
| **BotFather** | https://t.me/BotFather | Управление ботом |

---

## 🔧 Локальная разработка

```bash
# Установка
npm install
cd bot-server && npm install && cd ..

# Запуск приложения
npm run dev                    # http://localhost:5173

# Запуск бота локально
cd bot-server && node index.js
```

---

## 📦 Деплой

### Автоматический (рекомендуется)

```bash
# Закоммитить и запушить changes
git add .
git commit -m "Your message"
git push origin main

# Netlify и Render автоматически задеплоят!
```

### Ручной

```bash
# Frontend (Netlify)
npm run build
npx netlify-cli deploy --prod --dir=dist

# Backend (Render)
# Зайти в dashboard.render.com → Manual Deploy
```

---

## 🔑 Токены и переменные

### Bot Server (Render)
```
TELEGRAM_BOT_TOKEN=8353631022:AAHWAts6QguP9--0S4eWxM1rb0Dr40Cmy2Y
WEB_APP_URL=https://superlative-gelato-2ffbac.netlify.app
RENDER_EXTERNAL_URL=https://mindflow-bot-5hph.onrender.com
```

---

## 🛠 Частые задачи

### Изменить описание бота
1. Открой [@BotFather](https://t.me/BotFather)
2. `/mybots` → выбери бота
3. `Edit Bot` → `Edit Description`

### Проверить логи бота
1. https://dashboard.render.com
2. Найди `mindflow-bot`
3. Вкладка `Logs`

### Очистить кеш Netlify
1. https://app.netlify.com
2. Найди `superlative-gelato-2ffbac`
3. `Deploys` → `Trigger deploy` → `Clear cache and deploy`

### Перезапустить бота
```bash
# Опция 1: Push в GitHub (автодеплой)
git commit --allow-empty -m "Redeploy"
git push

# Опция 2: Manual Deploy в Render Dashboard
```

---

## 🐛 Траблшутинг

### Бот не отвечает
1. Проверь https://mindflow-bot-5hph.onrender.com (должен вернуть JSON)
2. Проверь UptimeRobot статус
3. Проверь логи в Render Dashboard
4. Manual Deploy в Render

### Приложение показывает старую версию
1. Проверь последний deploy на Netlify
2. Очисти кеш: Ctrl+Shift+R (или Cmd+Shift+R на Mac)
3. Trigger новый deploy в Netlify

### База данных не работает
1. Открой DevTools → Console
2. Проверь ошибки IndexedDB
3. Application → IndexedDB → Delete database → перезагрузи

---

## 📁 Структура файлов

```
mindflow-app/
├── src/
│   ├── pages/           # Страницы (Journal, Tasks, AIAssistant, Settings)
│   ├── components/      # Компоненты (Navigation, ui, journal, etc)
│   ├── db/             # database.js - IndexedDB схема
│   ├── services/       # chatService.js - AI логика
│   ├── store/          # useStore.js - Zustand state
│   └── utils/          # telegram.js, analytics.js, i18n.js
├── bot-server/
│   ├── index.js        # Telegram бот код
│   └── package.json    # Зависимости бота
├── DEVELOPER_GUIDE.md  # Полная документация
├── README.md           # Описание проекта
└── QUICK_START.md      # Этот файл
```

---

## ⚡️ Команды

```bash
# Development
npm run dev              # Dev server
npm run build            # Production build
npm run preview          # Preview build

# Git
git add .
git commit -m "message"
git push origin main

# Netlify
npx netlify-cli deploy --prod --dir=dist
```

---

## 🎨 Важные паттерны кода

### Добавить новую страницу
1. Создай `src/pages/NewPage.jsx`
2. Добавь в `src/App.jsx`:
```javascript
import NewPage from './pages/NewPage';

// В renderPage():
case 'newpage':
  return <NewPage />;
```
3. Добавь в `src/components/Navigation.jsx`

### Работа с базой
```javascript
import { journalEntries, tasks } from './db/database';

// Получить данные
const entries = await journalEntries.getAll();
const today = await tasks.getToday();

// Создать
await journalEntries.create({ date, mood, energy... });
await tasks.create({ title, when: 'today' });

// Обновить
await journalEntries.update(id, { mood: 8 });
await tasks.toggleComplete(id);
```

### Добавить AI ответ
Отредактируй `src/services/chatService.js`:
```javascript
if (lowerMessage.includes('твоё_слово')) {
  return 'Ответ AI';
}
```

---

## 📖 Дополнительная документация

- **Полная документация**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **Keep-alive бота**: [bot-server/keep-alive.md](./bot-server/keep-alive.md)
- **Netlify config**: [netlify.toml](./netlify.toml)
- **Render config**: [render.yaml](./render.yaml)

---

## 💡 Советы

1. **Всегда тестируй в Telegram** — некоторые фичи работают только там
2. **Используй UptimeRobot** — чтобы бот не засыпал
3. **Коммить часто** — автодеплой очень удобен
4. **Проверяй логи Render** — если бот глючит
5. **IndexedDB очищается** — при смене версии схемы (см. database.js)

---

Made with ❤️ by Roman Makarov & Claude Code
