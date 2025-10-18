import { Bot, InlineKeyboard } from 'grammy';

// Bot configuration from environment variables
const BOT_TOKEN = process.env.BOT_TOKEN || '8353631022:AAHWAts6QguP9--0S4eWxM1rb0Dr40Cmy2Y';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://superlative-gelato-2ffbac.netlify.app';

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
