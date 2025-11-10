import { Bot, InlineKeyboard, webhookCallback } from 'grammy';
import http from 'http';

// Bot configuration from environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://makarovflow.vercel.app';
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.WEBHOOK_URL || process.env.RENDER_EXTERNAL_URL;

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

// Обработка ошибок
bot.catch((err) => {
  console.error('❌ Ошибка бота:', err);
});

// Создаём HTTP сервер с поддержкой webhook
const handleWebhook = webhookCallback(bot, 'http');

const server = http.createServer(async (req, res) => {
  // Health check endpoint
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      bot: 'MakarovFlow',
      uptime: process.uptime()
    }));
    return;
  }

  // Webhook endpoint для Telegram
  if (req.url === '/webhook' && req.method === 'POST') {
    try {
      await handleWebhook(req, res);
    } catch (err) {
      console.error('❌ Webhook error:', err);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
    return;
  }

  // 404 для остальных запросов
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, async () => {
  console.log(`🌐 HTTP Server running on port ${PORT}`);
  console.log('📱 Telegram: @makarovflow_bot');
  console.log('🌐 Web App:', WEB_APP_URL);

  // Устанавливаем webhook если указан WEBHOOK_URL
  if (WEBHOOK_URL) {
    try {
      const webhookUrl = `${WEBHOOK_URL}/webhook`;
      await bot.api.setWebhook(webhookUrl);
      console.log(`✅ Webhook установлен: ${webhookUrl}`);
    } catch (err) {
      console.error('❌ Ошибка установки webhook:', err);
      console.log('⚠️ Бот продолжит работу, но может не отвечать на сообщения');
    }
  } else {
    console.log('⚠️ WEBHOOK_URL не установлен');
    console.log('💡 Установите переменную WEBHOOK_URL или RENDER_EXTERNAL_URL');
    console.log('💡 Пример: https://mindflow-bot-5hph.onrender.com');
  }
});
