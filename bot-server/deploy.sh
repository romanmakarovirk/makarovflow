#!/bin/bash

echo "🚀 Деплой бота MakarovFlow на Railway"
echo "========================================"
echo ""

# Шаг 1: Вход в Railway
echo "📝 Шаг 1: Вход в Railway..."
echo "Сейчас откроется браузер для входа через GitHub"
railway login

if [ $? -ne 0 ]; then
    echo "❌ Ошибка входа в Railway"
    exit 1
fi

echo "✅ Вход выполнен успешно!"
echo ""

# Шаг 2: Инициализация проекта
echo "📝 Шаг 2: Инициализация проекта..."
railway init

if [ $? -ne 0 ]; then
    echo "❌ Ошибка инициализации проекта"
    exit 1
fi

echo "✅ Проект инициализирован!"
echo ""

# Шаг 3: Деплой
echo "📝 Шаг 3: Деплой бота на Railway..."
railway up

if [ $? -ne 0 ]; then
    echo "❌ Ошибка деплоя"
    exit 1
fi

echo "✅ Бот задеплоен!"
echo ""

# Шаг 4: Установка переменных окружения
echo "📝 Шаг 4: Установка переменных окружения..."
railway variables set TELEGRAM_BOT_TOKEN=8353631022:AAHWAts6QguP9--0S4eWxM1rb0Dr40Cmy2Y
railway variables set WEB_APP_URL=https://makarovflow.vercel.app
railway variables set NODE_ENV=production

if [ $? -ne 0 ]; then
    echo "⚠️  Ошибка установки переменных. Установи их вручную через веб-интерфейс Railway"
fi

echo ""
echo "✅ Готово! Бот запущен на Railway!"
echo ""
echo "🔗 Открой Railway Dashboard для проверки:"
echo "   https://railway.app/dashboard"
echo ""
echo "📱 Проверь бота в Telegram:"
echo "   @makarovflow_bot"
echo ""
echo "📊 Посмотреть логи:"
echo "   railway logs"
