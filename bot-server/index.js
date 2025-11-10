import { Bot, InlineKeyboard } from 'grammy';
import http from 'http';

// Bot configuration from environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://makarovflow.vercel.app';
const PORT = process.env.PORT || 3000;

// Validate required environment variables
if (!BOT_TOKEN) {
  console.error('❌ ERROR: TELEGRAM_BOT_TOKEN is required!');
  console.error('Please set TELEGRAM_BOT_TOKEN environment variable.');
  process.exit(1);
}

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
  console.error('❌ Ошибка бота:', err);
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
  console.log(`🔄 Keep-alive enabled for localhost:${PORT}`);
});

// Keep-alive функция для предотвращения засыпания на Render
function keepAlive() {
  // Используем простой HTTP запрос к самому себе
  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Keep-alive ping: ${res.statusCode}`);
  });

  req.on('error', (err) => {
    console.log('⚠️ Keep-alive ping failed:', err.message);
  });

  req.on('timeout', () => {
    console.log('⚠️ Keep-alive ping timeout');
    req.destroy();
  });

  req.end();
}

// Пингуем сервер каждые 10 минут (Render засыпает через 15 минут неактивности)
setInterval(keepAlive, 10 * 60 * 1000);

// Первый пинг через 1 минуту после запуска
setTimeout(keepAlive, 60 * 1000);
