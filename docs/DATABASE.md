# Настройка базы данных для MakarovFlow

Этот документ описывает, как настроить облачную базу данных для хранения пользовательских данных.

## 📌 Текущая ситуация

**Сейчас:** Все данные хранятся локально в браузере пользователя (IndexedDB через Dexie.js)

**Проблемы:**
- ❌ Данные привязаны к устройству
- ❌ При переустановке Telegram все данные теряются
- ❌ Невозможен доступ с других устройств
- ❌ Нет синхронизации между устройствами

## ☁️ Решение: Облачная база данных

### Рекомендуемый стек:

1. **Supabase** (PostgreSQL + REST API + Auth)
2. **Backend на Render.com** (Node.js + Express)
3. **Синхронизация** между локальным IndexedDB и облаком

## 🚀 Вариант 1: Supabase (Рекомендуется)

**Supabase** - Firebase альтернатива с PostgreSQL, бесплатный план до 500 MB.

### Преимущества:
- ✅ Бесплатно до 500 MB
- ✅ Встроенная авторизация
- ✅ Realtime подписки
- ✅ REST API из коробки
- ✅ Dashboard для просмотра данных
- ✅ Автоматические бэкапы

### Настройка:

#### 1. Создать проект на Supabase

```bash
# Зайти на https://supabase.com
# Создать аккаунт
# Создать новый проект
# Получить API URL и API Key
```

#### 2. Создать таблицы

```sql
-- Таблица пользователей
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица записей дневника
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood TEXT NOT NULL,
  mood_emoji TEXT NOT NULL,
  energy INTEGER,
  sleep_hours DECIMAL,
  sleep_quality INTEGER,
  tags TEXT[],
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Таблица расписания
CREATE TABLE schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  color TEXT,
  recurring BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица домашних заданий
CREATE TABLE homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX idx_journal_user_date ON journal_entries(user_id, date DESC);
CREATE INDEX idx_schedule_user_day ON schedule(user_id, day_of_week);
CREATE INDEX idx_homework_user_date ON homework(user_id, due_date);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
```

#### 3. Установить Supabase Client

```bash
npm install @supabase/supabase-js
```

#### 4. Создать Supabase клиент

Создать файл `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Функция для инициализации пользователя
export async function initUser(telegramUser) {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      telegram_id: telegramUser.id,
      username: telegramUser.username,
      first_name: telegramUser.first_name
    }, {
      onConflict: 'telegram_id'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Функция для сохранения записи дневника
export async function saveJournalEntry(userId, entry) {
  const { data, error } = await supabase
    .from('journal_entries')
    .upsert({
      user_id: userId,
      ...entry
    }, {
      onConflict: 'user_id,date'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Функция для получения всех записей
export async function getJournalEntries(userId, limit = 30) {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
```

#### 5. Обновить .env файл

```bash
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🔄 Вариант 2: Render + PostgreSQL

### Настройка:

1. **Создать PostgreSQL базу на Render.com**
   - Зайти на https://render.com
   - Нажать "New +" → "PostgreSQL"
   - Выбрать Free план
   - Создать базу

2. **Создать Express Backend**

```javascript
// server.js
import express from 'express';
import pg from 'pg';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// API эндпоинты
app.post('/api/journal', async (req, res) => {
  const { userId, entry } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO journal_entries (user_id, date, mood, mood_emoji, energy, sleep_hours, sleep_quality, tags, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id, date) DO UPDATE SET
         mood = EXCLUDED.mood,
         mood_emoji = EXCLUDED.mood_emoji,
         energy = EXCLUDED.energy,
         sleep_hours = EXCLUDED.sleep_hours,
         sleep_quality = EXCLUDED.sleep_quality,
         tags = EXCLUDED.tags,
         note = EXCLUDED.note,
         updated_at = NOW()
       RETURNING *`,
      [userId, entry.date, entry.mood, entry.moodEmoji, entry.energy, entry.sleepHours, entry.sleepQuality, entry.tags, entry.note]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/journal/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY date DESC LIMIT 30',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## 🔐 Безопасность

### Аутентификация через Telegram

```javascript
import crypto from 'crypto';

// Проверка данных от Telegram WebApp
function verifyTelegramWebAppData(telegramInitData, botToken) {
  const initData = new URLSearchParams(telegramInitData);
  const hash = initData.get('hash');
  initData.delete('hash');

  const dataCheckString = Array.from(initData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
}
```

## 📊 Мониторинг данных

### Supabase Dashboard:
1. Зайти на https://app.supabase.com
2. Выбрать проект
3. Table Editor - просмотр всех таблиц
4. SQL Editor - выполнение запросов

### Полезные SQL запросы:

```sql
-- Посмотреть всех пользователей
SELECT * FROM users ORDER BY created_at DESC;

-- Посмотреть записи конкретного пользователя
SELECT * FROM journal_entries WHERE user_id = 'USER_ID' ORDER BY date DESC;

-- Посмотреть количество записей по дням
SELECT date, COUNT(*) as entries
FROM journal_entries
GROUP BY date
ORDER BY date DESC;

-- Посмотреть Premium пользователей
SELECT * FROM users WHERE is_premium = TRUE;
```

## 🔄 Миграция данных

Создать скрипт для переноса данных из IndexedDB в Supabase:

```javascript
async function migrateToCloud() {
  const localEntries = await journalEntries.getAll();

  for (const entry of localEntries) {
    await saveJournalEntry(userId, entry);
  }

  console.log(`✅ Migrated ${localEntries.length} entries to cloud`);
}
```

## 📝 TODO:

- [ ] Создать проект на Supabase
- [ ] Создать все таблицы
- [ ] Установить Supabase Client
- [ ] Создать API wrapper
- [ ] Добавить синхронизацию
- [ ] Добавить offline-first подход
- [ ] Протестировать на реальных данных
- [ ] Создать скрипт миграции

## 🆘 Поддержка:

- Supabase Docs: https://supabase.com/docs
- Postgres Tutorial: https://www.postgresql.org/docs/
- Render.com: https://render.com/docs
