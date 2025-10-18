# Dockerfile для MindFlow API Server
FROM node:20-alpine

# Установка рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

# Порт приложения
EXPOSE 3000

# Запуск сервера
CMD ["node", "server.js"]
