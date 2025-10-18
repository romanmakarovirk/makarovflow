import { Bot, InlineKeyboard } from 'grammy';
import http from 'http';

// Bot configuration from environment variables
const BOT_TOKEN = process.env.BOT_TOKEN || '8353631022:AAHWAts6QguP9--0S4eWxM1rb0Dr40Cmy2Y';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://superlative-gelato-2ffbac.netlify.app';
const PORT = process.env.PORT || 3000;

// Создаём бота
const bot = new Bot(BOT_TOKEN);

// Обработчик команды /start
bot.command('start', async (ctx) => {
  const keyboard = new InlineKeyboard()
    .webApp('🚀 Открыть MakarovFlow', WEB_APP_URL);

  await ctx.reply(
    `👋 Привет! Добро пожаловать в **MakarovFlow**!

📖 *Дневник настроения* с AI-аналитикой
📊 *Трекинг* энергии и сна
📚 *Инструменты* для учёбы
🔢 *Калькуляторы* и расписание

Нажми кнопку ниже, чтобы начать! 👇`,
    {
      reply_markup: keyboard,
      parse_mode: 'Markdown'
    }
  );
});

// Обработчик всех остальных сообщений
bot.on('message', async (ctx) => {
  const keyboard = new InlineKeyboard()
    .webApp('🚀 Открыть MakarovFlow', WEB_APP_URL);

  await ctx.reply(
    'Используй команду /start чтобы начать! 😊',
    { reply_markup: keyboard }
  );
});

// Запуск бота
bot.start({
  onStart: () => {
    console.log('✅ Бот запущен!');
    console.log('📱 Telegram: @makarovflow_bot');
    console.log('🌐 Web App:', WEB_APP_URL);
  }
});

// Обработка ошибок
bot.catch((err) => {
  console.error('❌ Ошибка:', err);
});

// Создаём HTTP сервер для Render (требуется открытый порт)
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    bot: 'MakarovFlow',
    uptime: process.uptime()
  }));
});

server.listen(PORT, () => {
  console.log(`🌐 HTTP Server running on port ${PORT}`);
});
