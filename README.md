# 📱 MakarovFlow - Telegram Mini App

**MakarovFlow** - это дневник настроения с AI-аналитикой и встроенными инструментами для учебы, предназначенный для школьников и студентов (13-25 лет).

## ✨ Возможности

### MVP (Фаза 1) ✅ ЗАВЕРШЕНО

#### 1. JOURNAL (Дневник) ✅ **ПОЛНОСТЬЮ ГОТОВ!**
- ✅ Страница дневника с полным функционалом
- ✅ Ежедневная запись настроения, энергии, сна (DailyCheckIn)
- ✅ Система тегов для отслеживания активностей (12 тегов)
- ✅ История записей в календарном виде (JournalCalendar)
- ✅ Детальный просмотр записей в модальном окне
- ✅ Редактирование существующих записей
- ✅ Локальное хранение в IndexedDB
- ✅ Валидация и Toast уведомления

#### 2. INSIGHTS (Аналитика) ✅ **ПОЛНОСТЬЮ ГОТОВ!**
- ✅ Страница аналитики с полным функционалом
- ✅ Недельная сводка с метриками (WeeklySummary)
- ✅ График динамики настроения (MoodChart)
- ✅ График паттернов сна (SleepChart)
- ✅ Умный анализ паттернов (10+ типов инсайтов)
- ✅ Корреляция между сном и настроением
- ✅ Анализ тегов и активностей
- ✅ Выбор периода (7/14/30 дней)
- 🔒 Premium: AI-анализ с предсказаниями (заглушка)

#### 3. STUDY (Учёба)
- ✅ Базовая страница учёбы
- 🔨 Расписание уроков/пар (в разработке)
- 🔨 Трекер домашних заданий (в разработке)
- 🔨 Калькуляторы (в разработке)
- 🔒 Premium: AI помощник для учёбы

#### 4. SETTINGS (Настройки)
- ✅ Переключение языка (RU/EN)
- ✅ Управление данными
- ✅ Экспорт и удаление данных
- ✅ Premium блок

## 🛠 Технологический стек

### Frontend
- **React 18+** - UI библиотека
- **Vite** - Сборщик и dev сервер
- **TailwindCSS** - Стилизация
- **Framer Motion** - Анимации
- **Recharts** - Графики и charts
- **Zustand** - State management

### Data & Storage
- **Dexie.js** - IndexedDB обёртка
- **localStorage** - Настройки и язык

### Integration
- **@twa-dev/sdk** - Telegram Web App SDK
- **i18next** - Интернационализация
- **Lucide React** - Иконки

## 📁 Структура проекта

```
mindflow-app/
├── src/
│   ├── components/       # Компоненты
│   │   ├── ui/          # UI kit (Button, Card, Input, etc) ✅
│   │   ├── journal/     # Компоненты дневника
│   │   ├── insights/    # Компоненты аналитики
│   │   └── study/       # Компоненты учёбы
│   ├── pages/           # Страницы приложения ✅
│   │   ├── Journal.jsx
│   │   ├── Insights.jsx
│   │   ├── Study.jsx
│   │   └── Settings.jsx
│   ├── hooks/           # Кастомные хуки
│   ├── store/           # Zustand store ✅
│   │   └── useStore.js
│   ├── utils/           # Утилиты ✅
│   │   ├── telegram.js
│   │   └── i18n.js
│   ├── db/              # Database (Dexie) ✅
│   │   └── database.js
│   ├── locales/         # Переводы ✅
│   │   ├── ru.json
│   │   └── en.json
│   ├── App.jsx          # Главный компонент ✅
│   └── main.jsx         # Entry point ✅
├── public/              # Статичные файлы
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🚀 Быстрый старт

### Установка

```bash
# Перейти в папку проекта
cd mindflow-app

# Установить зависимости
npm install

# Запустить dev сервер
npm run dev
```

Приложение откроется на `http://localhost:5173`

### Сборка для production

```bash
npm run build
```

## 🎨 Дизайн система

### Цветовая палитра
- **Background**: `#111827` (gray-900)
- **Cards**: `rgba(31, 41, 55, 0.5)` (gray-800/50)
- **Градиенты**:
  - Journal: `blue-500 → purple-600`
  - Insights: `green-500 → teal-600`
  - Study: `orange-500 → red-600`
  - Settings: `purple-400 → pink-600`

### UI Components (Готовые)
- ✅ **Button** - С вариантами (primary, secondary, danger, ghost, success)
- ✅ **Card** - С glassmorphism эффектом
- ✅ **Input** - Текстовые поля с темной темой
- ✅ **Slider** - Range input для энергии
- ✅ **Tag** - Селектор тегов с multi-select
- ✅ **Modal** - Модальные окна с анимацией
- ✅ **Toast** - Уведомления (success, error, warning, info)
- ✅ **Select** - Dropdown селектор
- ✅ **Navigation** - Нижняя навигация с анимацией

## 📊 База данных (IndexedDB)

### Таблицы

1. **journal_entries** - Записи дневника
   ```javascript
   {
     id: string,
     date: string,
     mood: number,
     moodEmoji: string,
     energy: number,
     sleepHours: number,
     sleepQuality: number,
     tags: string[],
     note: string,
     photoUrl: string,
     createdAt: timestamp,
     updatedAt: timestamp
   }
   ```

2. **schedule** - Расписание уроков
   ```javascript
   {
     id: string,
     subject: string,
     dayOfWeek: number,
     startTime: string,
     endTime: string,
     room: string,
     color: string,
     recurring: boolean
   }
   ```

3. **homework** - Домашние задания
   ```javascript
   {
     id: string,
     subject: string,
     description: string,
     dueDate: string,
     priority: string,
     completed: boolean,
     completedAt: timestamp,
     createdAt: timestamp
   }
   ```

4. **settings** - Настройки приложения
   ```javascript
   {
     id: 1,
     language: string,
     notifications: {
       dailyReminder: boolean,
       homeworkReminders: boolean,
       weeklyInsights: boolean
     },
     isPremium: boolean,
     premiumExpiresAt: timestamp
   }
   ```

## 🔔 Telegram интеграция

### Инициализация
```javascript
import { initTelegramApp } from './utils/telegram';
initTelegramApp();
```

### Haptic Feedback
```javascript
import { haptic } from './utils/telegram';

haptic.light();    // Легкая вибрация
haptic.medium();   // Средняя вибрация
haptic.heavy();    // Сильная вибрация
haptic.success();  // Успех
haptic.error();    // Ошибка
haptic.warning();  // Предупреждение
```

### Main Button
```javascript
import { mainButton } from './utils/telegram';

mainButton.show('Сохранить', () => {
  // Действие при клике
});
mainButton.hide();
```

### Back Button
```javascript
import { backButton } from './utils/telegram';

backButton.show(() => {
  // Действие при нажатии назад
});
backButton.hide();
```

## 🌐 Мультиязычность

Приложение поддерживает русский и английский языки из коробки.

### Использование в компонентах
```javascript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('journal.title')}</h1>
      <p>{t('journal.noEntries')}</p>
    </div>
  );
}
```

### Смена языка
```javascript
import { useStore } from './store/useStore';
import { useTranslation } from 'react-i18next';

const { setLanguage } = useStore();
const { i18n } = useTranslation();

const changeLanguage = async (lang) => {
  await setLanguage(lang);
  i18n.changeLanguage(lang);
};
```

### Добавление переводов
Редактируйте файлы:
- `src/locales/ru.json` - Русские переводы
- `src/locales/en.json` - Английские переводы

## 📈 Следующие этапы разработки

### ~~Этап 2: Функционал Journal~~ ✅ **ЗАВЕРШЕН!**
- ✅ Компонент DailyCheckIn
  - ✅ MoodSelector (эмодзи кнопки с анимацией)
  - ✅ Energy slider (0-100%)
  - ✅ SleepTracker (часы + качество)
  - ✅ TagsSelector (12 тегов с мульти-выбором)
  - ✅ Note textarea
- ✅ Компонент JournalCalendar
  - ✅ Месячный вид календаря
  - ✅ Цветовая индикация по настроению
  - ✅ Индикатор качества сна
  - ✅ Модальное окно с детальной записью
  - ✅ Навигация по месяцам
- ✅ Полная интеграция с IndexedDB

**📄 См. [JOURNAL_COMPONENTS.md](./JOURNAL_COMPONENTS.md) для детальной документации**

### ~~Этап 3: Функционал Insights~~ ✅ **ЗАВЕРШЕН!**
- ✅ Компонент WeeklySummary (метрики + тренды)
- ✅ MoodChart (линейный график с Area)
- ✅ SleepChart (столбчатый с цветовой кодировкой)
- ✅ InsightsList (умные рекомендации)
- ✅ Алгоритм анализа паттернов (10+ типов)
  - ✅ Анализ сна и энергии
  - ✅ Корреляция сон-настроение
  - ✅ Анализ трендов (улучшение/ухудшение)
  - ✅ Анализ тегов и активностей
  - ✅ Рекомендации по прогулкам, спорту, стрессу
- ✅ Premium заглушка для AI

### Этап 4: Функционал Study
- [ ] Вкладка Schedule
  - [ ] Список уроков
  - [ ] Форма добавления урока
- [ ] Вкладка Homework
  - [ ] Список заданий
  - [ ] Форма добавления задания
- [ ] Вкладка Calculators
  - [ ] GPA калькулятор
  - [ ] Базовый калькулятор
  - [ ] И другие

### Этап 5: Premium и монетизация
- [ ] Интеграция с Telegram Payments
- [ ] AI анализатор
- [ ] AI помощник для учёбы

## 🤝 Разработка

### Команды
```bash
npm run dev      # Запуск dev сервера (http://localhost:5173)
npm run build    # Production сборка
npm run preview  # Предпросмотр production сборки
npm run lint     # ESLint проверка
```

### Стиль кода
- ES6+ синтаксис
- Functional components с хуками
- Tailwind для стилизации
- Prettier для форматирования

## 🐛 Известные проблемы

- Telegram SDK работает только в среде Telegram Mini App
- В dev режиме некоторые функции Telegram могут не работать

## 📄 Лицензия

MIT License

---

**Made with ❤️ for students**

Version: 1.0.0 (MVP Stage 1)
