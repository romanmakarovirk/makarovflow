# Dockerfile для MindFlow Telegram Bot
FROM node:20-alpine

# Установка рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

# Порт для HTTP сервера (опционально)
EXPOSE 3000

# Запуск бота
CMD ["node", "index.js"]
