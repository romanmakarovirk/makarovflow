# 📓 Journal Components Documentation

## Обзор

Journal страница полностью функциональна! Реализованы все компоненты для создания и просмотра записей дневника.

## 🎨 Компоненты

### 1. **MoodSelector**
`src/components/journal/MoodSelector.jsx`

Селектор настроения с эмодзи кнопками.

**Props:**
- `value: { value: number, emoji: string }` - текущее выбранное настроение
- `onChange: (mood) => void` - callback при выборе настроения

**Особенности:**
- 5 уровней настроения (😢 😟 😐 🙂 😊)
- Градиентные цвета для каждого уровня
- Анимация при выборе (Framer Motion)
- Haptic feedback при клике

**Использование:**
```jsx
const [mood, setMood] = useState(null);

<MoodSelector
  value={mood}
  onChange={setMood}
/>
```

---

### 2. **SleepTracker**
`src/components/journal/SleepTracker.jsx`

Трекер сна с вводом часов и оценкой качества.

**Props:**
- `sleepHours: number` - количество часов сна
- `sleepQuality: number` - качество сна (1-5 звезд)
- `onChange: ({ sleepHours, sleepQuality }) => void`

**Особенности:**
- Input для часов сна (с шагом 0.5)
- 5 звезд для оценки качества
- Индикатор качества сна (эмодзи + текст)
- Иконки Moon и Star (Lucide)

**Использование:**
```jsx
const [sleep, setSleep] = useState({
  sleepHours: 7,
  sleepQuality: 3
});

<SleepTracker
  sleepHours={sleep.sleepHours}
  sleepQuality={sleep.sleepQuality}
  onChange={setSleep}
/>
```

---

### 3. **TagsSelector**
`src/components/journal/TagsSelector.jsx`

Селектор активностей/тегов с мульти-выбором.

**Props:**
- `selectedTags: string[]` - массив выбранных тегов
- `onChange: (tags: string[]) => void`

**Теги:**
```javascript
[
  'walked_outside',      // 🌳 Гулял на улице
  'lot_of_homework',     // 📚 Много домашки
  'met_friends',         // 👥 Встречался с друзьями
  'exercised',           // 💪 Занимался спортом
  'felt_stressed',       // 😰 Был в стрессе
  'ate_well',            // 🍎 Хорошо питался
  'productive_day',      // ✅ Продуктивный день
  'lazy_day',            // 😴 Ленивый день
  'studied',             // 📖 Учился
  'watched_movies',      // 🎬 Смотрел фильмы
  'played_games',        // 🎮 Играл в игры
  'family_time'          // 👨‍👩‍👧‍👦 Время с семьёй
]
```

**Особенности:**
- Показывает первые 6 тегов, остальные скрыты
- Кнопка "Показать все" для раскрытия
- Счетчик выбранных тегов
- Переводы через i18next

---

### 4. **DailyCheckIn**
`src/components/journal/DailyCheckIn.jsx`

Главная форма для создания/редактирования записи.

**Props:**
- `onSave: () => void` - callback после сохранения
- `onCancel: () => void` - callback при отмене
- `existingEntry: Entry | null` - существующая запись (для редактирования)

**Поля формы:**
- Mood (MoodSelector)
- Energy (Slider 0-100%)
- Sleep hours + quality (SleepTracker)
- Tags (TagsSelector)
- Note (textarea)

**Валидация:**
- Настроение обязательно
- Проверка на дубликаты по дате
- Toast уведомления

**Сохранение:**
```javascript
// Создание новой записи
await journalEntries.create({
  date: '2025-10-18',
  mood: 8,
  moodEmoji: '🙂',
  energy: 70,
  sleepHours: 7.5,
  sleepQuality: 4,
  tags: ['walked_outside', 'studied'],
  note: 'Хороший день!'
});

// Обновление существующей
await journalEntries.update(entryId, { ...updates });
```

---

### 5. **JournalCalendar**
`src/components/journal/JournalCalendar.jsx`

Календарь с историей записей за месяц.

**Props:**
- `onDateSelect: (date: Date) => void` - callback при клике на день

**Особенности:**
- Месячный вид календаря
- Цветовые индикаторы настроения:
  - 🔴 Красный: mood < 3
  - 🟠 Оранжевый: mood 3-5
  - 🟡 Жёлтый: mood 5-7
  - 🟢 Зелёный: mood 7-9
  - 🔵 Бирюзовый: mood >= 9
- Индикатор качества сна (синий кружочек)
- Модалка с детальным просмотром записи
- Навигация по месяцам (◄ ►)
- Блокировка будущих дат

**Индикаторы:**
```
• Большой кружок = настроение
• Маленький кружок = качество сна
• Серый кружок = день без записи
• Ring = сегодняшний день
```

**Модалка:**
При клике на день с записью открывается модальное окно с:
- Эмодзи настроения
- Уровень настроения (X/10)
- Энергия (progress bar)
- Сон (часы + качество)
- Теги активностей
- Заметка

---

## 📄 **Journal Page**
`src/pages/Journal.jsx`

Главная страница дневника, объединяющая все компоненты.

**Состояния:**
- `showCheckIn` - показать/скрыть форму
- `hasEntries` - есть ли записи в БД
- `todayEntry` - запись на сегодня

**Режимы отображения:**

### 1. Empty State (нет записей)
```
┌────────────────────────┐
│   📖 Иконка            │
│   Пока нет записей     │
│   [Создать первую]     │
└────────────────────────┘
```

### 2. Has Entries (есть записи)
```
┌────────────────────────┐
│ Дневник    [+ Новая]   │
├────────────────────────┤
│ ✅ Запись на сегодня   │ (если есть)
│ Настроение: 8/10...    │
├────────────────────────┤
│ История                │
│ [Календарь]            │
├────────────────────────┤
│ 📊 Статистика          │
│ [Записей] [Сегодня]    │
└────────────────────────┘
```

### 3. Check-in Mode (создание записи)
```
┌────────────────────────┐
│ Дневник                │
├────────────────────────┤
│ [DailyCheckIn Form]    │
│ • Mood                 │
│ • Energy               │
│ • Sleep                │
│ • Tags                 │
│ • Note                 │
│ [Отмена] [Сохранить]   │
└────────────────────────┘
```

**Функции:**
```javascript
checkTodayEntry()    // Проверить запись на сегодня
checkHasEntries()    // Проверить наличие записей
handleSaveEntry()    // Обработка сохранения
handleNewEntry()     // Открыть форму
```

---

## 🗄️ **Database Integration**

Все компоненты работают с IndexedDB через Dexie.

**Основные операции:**

```javascript
import { journalEntries } from '../db/database';

// Получить все записи
const entries = await journalEntries.getAll();

// Получить запись по дате
const entry = await journalEntries.getByDate('2025-10-18');

// Создать запись
await journalEntries.create({
  date: '2025-10-18',
  mood: 8,
  moodEmoji: '🙂',
  energy: 70,
  sleepHours: 7,
  sleepQuality: 4,
  tags: ['walked_outside'],
  note: 'Good day!'
});

// Обновить запись
await journalEntries.update(id, { mood: 9 });

// Удалить запись
await journalEntries.delete(id);

// Проверить существование
const exists = await journalEntries.existsForDate('2025-10-18');

// Получить последние N записей
const recent = await journalEntries.getLastN(7);

// Получить диапазон дат
const range = await journalEntries.getByDateRange(
  '2025-10-01',
  '2025-10-31'
);
```

---

## 🎨 **Стилизация**

Все компоненты используют:
- **TailwindCSS** для стилей
- **Framer Motion** для анимаций
- **Lucide React** для иконок
- **Haptic Feedback** для вибрации (Telegram)

**Цветовая схема:**
```css
Mood colors:
- Very bad:  red-500 → orange-600
- Bad:       orange-500 → yellow-600
- Neutral:   yellow-500 → green-500
- Good:      green-500 → teal-500
- Very good: teal-500 → blue-500

Background: gray-900
Cards:      gray-800/50
Borders:    gray-700
```

---

## ✅ **Что работает:**

1. ✅ Создание новых записей
2. ✅ Редактирование записей (клик на "Редактировать")
3. ✅ Просмотр истории в календаре
4. ✅ Детальный просмотр записи (клик на день)
5. ✅ Валидация (нельзя создать 2 записи на один день)
6. ✅ Сохранение в IndexedDB
7. ✅ Toast уведомления
8. ✅ Анимации и переходы
9. ✅ Haptic feedback
10. ✅ Мультиязычность (RU/EN)

---

## 🔜 **Следующие шаги:**

1. **Insights Page** - графики и аналитика
2. **Study Page** - расписание и домашка
3. **Notifications** - напоминания через Telegram
4. **Export** - PDF экспорт записей (Premium)
5. **AI Analysis** - анализ паттернов (Premium)

---

## 🐛 **Известные ограничения:**

- Пока нельзя удалять записи (добавить позже)
- Нет поиска по записям
- Нет фильтрации по тегам
- Нет экспорта в PDF (только JSON)

---

Made with ❤️ by Claude Code
