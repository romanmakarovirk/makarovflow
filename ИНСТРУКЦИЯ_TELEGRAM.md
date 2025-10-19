# 📱 Инструкция: Подключение MindFlow к Telegram

## Шаг 1: Добавь API ключ в Vercel (1 минута)

### Вариант A: Через веб-интерфейс (проще)
1. Открой: https://vercel.com/romanmakarovirk/makarovflow/settings/environment-variables
2. Нажми **"Add New"** или **"Add Variable"**
3. Заполни:
   - **Key**: `VITE_OPENROUTER_API_KEY`
   - **Value**: `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`
   - **Environments**: отметь все три галочки (Production, Preview, Development)
4. Нажми **"Save"**
5. Vercel спросит "Redeploy?" - нажми **"Redeploy"** чтобы применить изменения

**Подожди 1-2 минуты пока пересоберётся проект**

---

## Шаг 2: Подключение к Telegram (3 минуты)

### Твой URL для Mini App:
```
https://makarovflow.vercel.app
```

### 2.1 Открой BotFather
1. Найди [@BotFather](https://t.me/BotFather) в Telegram
2. Напиши `/mybots`
3. Выбери своего бота (MindFlow Bot или как он называется)

### 2.2 Настрой Mini App
1. Нажми **"Bot Settings"**
2. Выбери **"Menu Button"**
3. Выбери **"Configure menu button"**
4. Отправь название: `Открыть MindFlow`
5. Отправь URL: `https://makarovflow.vercel.app`

### 2.3 Альтернативный способ - Web App в команде
1. В BotFather выбери **"Edit Commands"**
2. Добавь команду:
```
start - Запустить MindFlow
app - Открыть приложение
```

3. Затем в коде бота добавь Web App кнопку:
```javascript
bot.onText(/\/start|\/app/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Добро пожаловать в MindFlow!', {
    reply_markup: {
      inline_keyboard: [[
        {
          text: '🚀 Открыть приложение',
          web_app: { url: 'https://makarovflow.vercel.app' }
        }
      ]]
    }
  });
});
```

---

## Шаг 3: Обнови код бота (если нужно)

Если у тебя уже есть бот, найди где в коде указан URL приложения и замени на:
```
https://makarovflow.vercel.app
```

Обычно это в файле типа `bot.js` или `index.js` в строках с `web_app`:

**Было:**
```javascript
web_app: { url: 'https://old-url.netlify.app' }
```

**Стало:**
```javascript
web_app: { url: 'https://makarovflow.vercel.app' }
```

Потом перезапусти бота:
```bash
pm2 restart bot
```
или
```bash
node bot.js
```

---

## Шаг 4: Протестируй

1. Открой своего бота в Telegram
2. Нажми /start или /app
3. Нажми на кнопку "Открыть приложение"
4. Должно открыться MindFlow приложение!

---

## 🔍 Проверка что всё работает

### Проверь AI:
1. Открой приложение
2. Перейди во вкладку **"AI"**
3. Напиши что-нибудь, например: "Привет"
4. Если AI отвечает умно (а не просто заготовленными фразами) - значит API ключ работает!

### Проверь расписание:
1. Вкладка **"Дневник"** → виджет **"Расписание"**
2. Добавь урок
3. Закрой и открой снова
4. Урок должен сохраниться!

---

## ❓ Частые проблемы

### AI не работает / отвечает шаблонами
- **Причина:** API ключ не добавлен в Vercel
- **Решение:** Повтори Шаг 1, не забудь нажать "Redeploy"

### Приложение не открывается в Telegram
- **Причина:** Неправильный URL в BotFather
- **Решение:** Проверь что URL точно `https://makarovflow.vercel.app` (без `/` в конце)

### Белый экран
- **Причина:** Vercel ещё не закончил деплой
- **Решение:** Подожди 2-3 минуты после Redeploy

---

## 📞 Поддержка

Если что-то не работает:
1. Проверь https://vercel.com/romanmakarovirk/makarovflow - статус должен быть **Ready** (зелёный)
2. Проверь что API ключ добавлен в Environment Variables
3. Проверь что в Telegram указан правильный URL

---

## ✅ После настройки

Твоё приложение будет:
- ✅ Работать 24/7 бесплатно
- ✅ Автоматически обновляться при git push
- ✅ Иметь настоящий AI (Claude 3.5 Sonnet)
- ✅ Сохранять расписание и все данные

**URL для бота:** `https://makarovflow.vercel.app`
