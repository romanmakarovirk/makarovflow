# 📚 MakarovFlow - Руководство для разработчика

## 🎯 Описание проекта

**MakarovFlow** — это Telegram Mini App для личной продуктивности с дневником настроения, AI-ассистентом и трекингом задач.

### Основные возможности:
- 📖 **Дневник настроения** с отслеживанием настроения, энергии и сна
- ✅ **Умные задачи** в стиле Things 3 с датами, напоминаниями и фильтрами
- 🤖 **AI-помощник** с контекстным пониманием твоих данных
- 📚 **Виджеты для учёбы** — расписание, домашка, калькуляторы GPA
- 📊 **Аналитика и стрики** — отслеживание прогресса и привычек
- 🌐 **Мультиязычность** — русский и английский интерфейс
- 💾 **Локальное хранение** — все данные только на твоём устройстве

---

## 🛠 Технологический стек

### Frontend (Telegram Mini App)
- **React 18.3** + Vite — быстрая разработка и HMR
- **Framer Motion** — плавные анимации и переходы
- **TailwindCSS** — utility-first стилизация
- **Dexie.js** — обёртка над IndexedDB для локального хранения
- **Zustand** — минималистичный state management
- **i18next** — интернационализация (ru/en)
- **Lucide React** — красивые иконки
- **@twa-dev/sdk** — Telegram Web Apps SDK

### Backend (Telegram Bot)
- **Node.js** — runtime для бота
- **Grammy** — современный фреймворк для Telegram ботов
- **Render.com** — хостинг бота (free tier)

### Деплой и мониторинг
- **Netlify** — хостинг React приложения
- **GitHub** — контроль версий и CI/CD
- **UptimeRobot** — мониторинг доступности бота
- **Render** — автодеплой из GitHub

---

## 📁 Структура проекта

```
mindflow-app/
├── src/
│   ├── components/          # React компоненты
│   │   ├── journal/        # Компоненты дневника
│   │   ├── ui/             # UI компоненты (Button, Card, Modal...)
│   │   ├── premium/        # Premium модалка
│   │   └── Navigation.jsx  # Нижнее навигационное меню
│   ├── pages/              # Страницы приложения
│   │   ├── Journal.jsx     # Дневник с виджетами
│   │   ├── Tasks.jsx       # Things 3 style задачи
│   │   ├── AIAssistant.jsx # AI-чат
│   │   └── Settings.jsx    # Настройки
│   ├── db/
│   │   └── database.js     # Dexie схема и хелперы
│   ├── services/
│   │   └── chatService.js  # AI чат сервис
│   ├── store/
│   │   └── useStore.js     # Zustand глобальное состояние
│   ├── utils/
│   │   ├── telegram.js     # Telegram SDK helpers
│   │   ├── analytics.js    # Аналитика и расчёты
│   │   └── i18n.js         # i18next конфигурация
│   ├── App.jsx             # Главный компонент
│   └── main.jsx            # Entry point
├── bot-server/
│   ├── index.js            # Telegram бот
│   ├── package.json        # Зависимости бота
│   └── keep-alive.md       # Инструкция по keep-alive
├── public/                 # Статические файлы
├── netlify.toml            # Конфиг Netlify
├── render.yaml             # Конфиг Render
├── package.json            # Зависимости приложения
├── vite.config.js          # Конфиг Vite
├── tailwind.config.js      # Конфиг TailwindCSS
└── DEVELOPER_GUIDE.md      # Эта документация
```

---

## 🗄 База данных (IndexedDB)

### Схема версии 3

```javascript
{
  journal_entries: {
    // Записи в дневнике
    id, date, mood, moodEmoji, energy,
    sleepHours, sleepQuality, createdAt, updatedAt
  },

  tasks: {
    // Задачи в стиле Things 3
    id, title, notes, list, when, deadline,
    reminder, completed, createdAt, completedAt
  },

  schedule: {
    // Расписание занятий
    id, subject, dayOfWeek, startTime,
    endTime, recurring
  },

  homework: {
    // Домашние задания
    id, subject, dueDate, priority,
    completed, createdAt, completedAt
  },

  ai_messages: {
    // История чата с AI
    id, role, content, createdAt
  },

  user_stats: {
    // Статистика пользователя
    id, totalEntries, currentStreak, longestStreak,
    lastEntryDate, totalTasks, completedTasks
  },

  settings: {
    // Настройки
    id, language, isPremium, premiumExpiresAt,
    aiUsage: { date, count, limit }
  }
}
```

### Примеры использования

```javascript
import { journalEntries, tasks, userStats } from './db/database';

// Получить записи за последние 7 дней
const entries = await journalEntries.getLastN(7);

// Создать новую задачу
await tasks.create({
  title: 'Сделать что-то',
  when: 'today',
  reminder: '14:00'
});

// Обновить статистику
await userStats.updateEntryStats();
```

---

## 🔗 Ссылки на сервисы

### Хостинг и деплой
- **Netlify (Frontend)**: https://app.netlify.com
  - Проект: `superlative-gelato-2ffbac`
  - URL: https://superlative-gelato-2ffbac.netlify.app
  - Автодеплой из ветки `main` на GitHub

- **Render (Bot Server)**: https://dashboard.render.com
  - Сервис: `mindflow-bot`
  - URL: https://mindflow-bot-5hph.onrender.com
  - Автодеплой из ветки `main` → папка `bot-server/`

### Репозиторий
- **GitHub**: https://github.com/romanmakarovirk/makarovflow
  - Все изменения пушатся сюда
  - Auto-deploy на Netlify и Render

### Telegram
- **Bot**: [@makarovflow_bot](https://t.me/makarovflow_bot)
- **BotFather**: [@BotFather](https://t.me/BotFather) — управление ботом

### Мониторинг
- **UptimeRobot**: https://uptimerobot.com
  - Мониторинг: `mindflow-bot-5hph.onrender.com`
  - Пинг каждые 5 минут → бот не засыпает

---

## ⚙️ Настройка проекта

### 1. Клонирование и установка

```bash
# Клонировать репозиторий
git clone https://github.com/romanmakarovirk/makarovflow.git
cd makarovflow

# Установить зависимости приложения
npm install

# Установить зависимости бота
cd bot-server
npm install
cd ..
```

### 2. Локальная разработка

```bash
# Запустить приложение (dev server на порту 5173)
npm run dev

# Запустить бота локально
cd bot-server
node index.js
```

### 3. Сборка и деплой

```bash
# Собрать продакшн версию
npm run build

# Задеплоить на Netlify
npx netlify-cli deploy --prod --dir=dist

# Деплой бота происходит автоматически при пуше в main
git add .
git commit -m "Update bot"
git push origin main
```

---

## 🔧 Переменные окружения

### Bot Server (Render.com)

В настройках Render добавлены:

```bash
TELEGRAM_BOT_TOKEN=8353631022:AAHWAts6QguP9--0S4eWxM1rb0Dr40Cmy2Y
WEB_APP_URL=https://superlative-gelato-2ffbac.netlify.app
PORT=3000
RENDER_EXTERNAL_URL=https://mindflow-bot-5hph.onrender.com
```

### Netlify

Не требует дополнительных переменных — static site.

---

## 🎨 Дизайн система

### Цвета
- **Purple/Blue/Cyan Gradient** — AI и акценты
- **Pink** — Настроение
- **Yellow** — Энергия
- **Blue** — Сон
- **Emerald** — Streak/Прогресс
- **Orange/Red** — Расписание
- **Gray 900/800/700** — Фоны и карточки

### Анимации (Framer Motion)
- **whileTap**: scale(0.95-0.98) — нажатия
- **whileHover**: scale(1.05) — hover
- **initial/animate**: fade + slide transitions
- **layoutId**: плавные переходы между состояниями

### iOS 26 Frosted Glass Effect
```jsx
<div className="bg-gradient-to-t from-gray-900/98 via-gray-900/95 to-gray-900/80 backdrop-blur-3xl backdrop-saturate-200 rounded-t-[40px] border-t border-white/[0.08]">
  {/* Содержимое */}
</div>
```

---

## 🤖 AI Помощник

### Как работает
AI использует **keyword-based responses** вместо внешних API:
- Анализирует вопрос по ключевым словам
- Подбирает релевантный ответ из предустановленных
- Использует контекст из дневника и задач пользователя

### Лимиты
- **Бесплатно**: 10 запросов в день
- **Premium**: 50 запросов в день
- Сбрасывается каждый день в 00:00

### Расширение AI

Чтобы добавить новые ответы, отредактируй `/src/services/chatService.js`:

```javascript
// Добавить новый кейс
if (lowerMessage.includes('твоё_ключевое_слово')) {
  return 'Твой ответ AI';
}
```

---

## 📱 Telegram Mini App

### Важные функции

```javascript
import { haptic, viewport } from './utils/telegram';

// Вибрация
haptic.light();     // Лёгкая
haptic.medium();    // Средняя
haptic.success();   // Успешное действие

// Viewport
viewport.expand();  // Развернуть на весь экран
```

### Тестирование Mini App

1. Открой бота: [@makarovflow_bot](https://t.me/makarovflow_bot)
2. Нажми `/start`
3. Нажми кнопку "Открыть MakarovFlow"
4. Приложение откроется в Telegram

---

## 🚀 Деплой и CI/CD

### Автоматический деплой

**При пуше в `main`:**
1. **GitHub** — получает изменения
2. **Netlify** — автоматически собирает и деплоит React app
3. **Render** — автоматически деплоит бота из папки `bot-server/`

### Ручной деплой

```bash
# Netlify
npm run build
npx netlify-cli deploy --prod --dir=dist

# Render
# Зайди в dashboard.render.com → Manual Deploy → Deploy latest commit
```

---

## 🧪 Тестирование

### Чек-лист перед деплоем

- [ ] Дневник: создание записи, редактирование, календарь
- [ ] Задачи: создание, фильтры (Все, Сегодня, Скоро, Готово), чекбокс
- [ ] AI: отправка сообщения, лимиты, suggested questions
- [ ] Настройки: смена языка, экспорт данных, очистка
- [ ] Навигация: переключение между табами, анимации
- [ ] Виджеты учёбы: отображение данных
- [ ] Телеграм бот: команда /start, открытие Web App

---

## 🐛 Известные проблемы и решения

### Проблема: Бот не отвечает
**Решение**:
1. Проверь https://mindflow-bot-5hph.onrender.com — должен вернуть JSON
2. Проверь UptimeRobot — статус должен быть "Up"
3. Зайди в Render Dashboard → Logs → проверь ошибки
4. Manual Deploy в Render

### Проблема: Netlify показывает старую версию
**Решение**:
1. Проверь, что изменения запушены в `main`
2. Зайди в Netlify → Deploys → проверь последний деплой
3. Очисти кеш браузера (Ctrl+Shift+R)

### Проблема: IndexedDB не работает
**Решение**:
- Проверь консоль браузера
- Убедись, что приложение открывается через HTTPS
- Очисти IndexedDB: DevTools → Application → IndexedDB → Delete

---

## 📈 Метрики и аналитика

### User Stats
- `totalEntries` — всего записей в дневнике
- `currentStreak` — текущий стрик (дни подряд)
- `longestStreak` — самый длинный стрик
- `totalTasks` — всего задач
- `completedTasks` — выполненных задач

### Weekly Summary (Journal)
- `avgMood` — среднее настроение за 7 дней
- `avgEnergy` — средняя энергия
- `avgSleep` — средний сон

---

## 🎯 Roadmap (возможные улучшения)

### Потенциальные фичи:
- [ ] Экспорт данных в PDF
- [ ] Уведомления через Telegram
- [ ] Shared goals (цели с друзьями)
- [ ] Настраиваемые темы оформления
- [ ] Backup в Telegram Cloud
- [ ] Интеграция с календарём
- [ ] Pomodoro таймер
- [ ] Habit tracker
- [ ] Mood trends графики (charts.js)
- [ ] Voice notes в дневнике

---

## 🔐 Безопасность

- **Все данные локально** — ничего не хранится на серверах
- **Нет аналитики** — никакого трекинга пользователей
- **Open source** — можешь проверить код
- **Telegram Safe** — работает внутри Telegram с их защитой

---

## 📞 Контакты и поддержка

- **GitHub Issues**: https://github.com/romanmakarovirk/makarovflow/issues
- **Telegram**: @romanmakarov (если есть)
- **Email**: (добавь свой email)

---

## 📄 Лицензия

Этот проект создан для личного использования Roman Makarov.

---

Made with ❤️ by Claude Code & Roman Makarov

**Версия**: 1.0.0
**Дата создания**: Октябрь 2025
**Последнее обновление**: $(date +%Y-%m-%d)
