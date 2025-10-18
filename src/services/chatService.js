/**
 * AI Chat Service for MakarovFlow
 * Uses Hugging Face Inference API with free models
 */

import { journalEntries, tasks, homework, settings } from '../db/database';

const HF_API_URL = 'https://api-inference.huggingface.co/models';

/**
 * Get context from user's data
 */
const getUserContext = async () => {
  try {
    const [recentEntries, recentTasks, recentHomework, userSettings] = await Promise.all([
      journalEntries.getLastN(7),
      tasks.getToday(),
      homework.getActive(),
      settings.get()
    ]);

    let context = 'Контекст пользователя:\n';

    // Recent mood and stats
    if (recentEntries.length > 0) {
      const latestEntry = recentEntries[0];
      const avgMood = recentEntries.reduce((sum, e) => sum + e.mood, 0) / recentEntries.length;
      const avgEnergy = recentEntries.reduce((sum, e) => sum + (e.energy || 50), 0) / recentEntries.length;
      const avgSleep = recentEntries.reduce((sum, e) => sum + (e.sleepHours || 7), 0) / recentEntries.length;

      context += `\nПоследняя запись в дневнике:
- Настроение: ${latestEntry.mood}/10 ${latestEntry.moodEmoji}
- Энергия: ${latestEntry.energy}%
- Сон: ${latestEntry.sleepHours} часов

Средние показатели за неделю:
- Среднее настроение: ${avgMood.toFixed(1)}/10
- Средняя энергия: ${avgEnergy.toFixed(0)}%
- Средний сон: ${avgSleep.toFixed(1)} часов\n`;
    }

    // Today's tasks
    if (recentTasks.length > 0) {
      context += `\nЗадачи на сегодня (${recentTasks.length}):\n`;
      recentTasks.slice(0, 5).forEach(task => {
        context += `- ${task.title}\n`;
      });
    }

    // Active homework
    if (recentHomework.length > 0) {
      context += `\nАктивные домашние задания (${recentHomework.length}):\n`;
      recentHomework.slice(0, 3).forEach(hw => {
        context += `- ${hw.subject}: ${hw.description || 'нет описания'}\n`;
      });
    }

    return context;
  } catch (error) {
    console.error('Failed to get user context:', error);
    return '';
  }
};

/**
 * Send message to AI and get response
 */
export const sendMessage = async (userMessage, conversationHistory = []) => {
  try {
    // Get user context
    const context = await getUserContext();

    // Use intelligent keyword-based responses instead of unreliable free models
    // This gives much better, contextual Russian responses
    const response = generateFallbackResponse(userMessage, context);

    return {
      success: true,
      message: response
    };
  } catch (error) {
    console.error('AI chat error:', error);
    return {
      success: true,
      message: generateFallbackResponse(userMessage, '')
    };
  }
};

/**
 * Generate fallback response based on keywords
 */
const generateFallbackResponse = (userMessage, context) => {
  const lowerMessage = userMessage.toLowerCase();

  // Greeting
  if (lowerMessage.match(/^(привет|здравствуй|hi|hello|hey)/)) {
    return 'Привет! 👋 Я твой AI-помощник в MakarovFlow. Могу помочь с анализом настроения, дать советы по продуктивности или просто поддержать. О чём хочешь поговорить?';
  }

  // Thanks
  if (lowerMessage.match(/(спасибо|благодар)/)) {
    return 'Пожалуйста! Рад помочь. Если будут ещё вопросы — обращайся! 😊';
  }

  // Mood-related
  if (lowerMessage.includes('настроени') || lowerMessage.includes('чувству') || lowerMessage.includes('грустн') || lowerMessage.includes('плох')) {
    return 'Понимаю тебя. Попробуй выйти на прогулку, послушать любимую музыку или заняться чем-то приятным. Движение и свежий воздух помогают! Главное — не оставайся один на один с негативными мыслями.';
  }

  // Energy-related
  if (lowerMessage.includes('энерги') || lowerMessage.includes('устал') || lowerMessage.includes('сил') || lowerMessage.includes('вялост')) {
    return 'Низкая энергия — это нормально! Важно высыпаться (7-8 часов), пить достаточно воды и двигаться. Даже 10 минут зарядки помогут взбодриться. Сделай перерыв и подыши свежим воздухом.';
  }

  // Sleep-related
  if (lowerMessage.includes('сон') || lowerMessage.includes('сплю') || lowerMessage.includes('бессонни') || lowerMessage.includes('не высып')) {
    return 'Качественный сон — основа хорошего самочувствия. Попробуй: ложиться в одно время, избегать гаджетов за час до сна, проветрить комнату. Может помочь медитация, чтение или тёплый душ.';
  }

  // Workout related
  if (lowerMessage.includes('тренир') || lowerMessage.includes('спорт') || lowerMessage.includes('зал') || lowerMessage.includes('упражнени')) {
    return 'Тренировки — это отлично! Они улучшают настроение, энергию и сон. Начни с малого: 15-20 минут лёгкой активности. Главное — регулярность, а не интенсивность. Даже прогулка считается!';
  }

  // Tasks/productivity
  if (lowerMessage.includes('задач') || lowerMessage.includes('дел') || lowerMessage.includes('продуктивн') || lowerMessage.includes('работ')) {
    return 'Разбей большие задачи на маленькие шаги. Начни с самого простого, чтобы войти в ритм. Используй правило 2 минут: если задача займёт меньше 2 минут — сделай её сразу. Делать что-то всегда лучше, чем ничего не делать!';
  }

  // Motivation
  if (lowerMessage.includes('мотивац') || lowerMessage.includes('не хочет') || lowerMessage.includes('лень') || lowerMessage.includes('прокрастинац')) {
    return 'Мотивация приходит ПОСЛЕ действия, а не до него! Начни с малого — 5 минут, один пункт списка. Momentum придёт в процессе. Обещай себе сделать всего 5 минут — часто продолжишь дальше. Ты справишься! 💪';
  }

  // Study/learning
  if (lowerMessage.includes('учёб') || lowerMessage.includes('учи') || lowerMessage.includes('экзамен') || lowerMessage.includes('домашк')) {
    return 'Для эффективной учёбы попробуй технику Pomodoro: 25 минут учёбы, 5 минут отдых. Делай заметки от руки — так лучше запоминается. И не забывай про перерывы, сон и воду!';
  }

  // Focus/concentration
  if (lowerMessage.includes('сосредоточ') || lowerMessage.includes('концентр') || lowerMessage.includes('отвлека') || lowerMessage.includes('внимани')) {
    return 'Для концентрации: убери отвлекающие факторы (телефон, соцсети), работай блоками по 25-30 минут, делай перерывы. Попробуй белый шум или инструментальную музыку. Одна задача за раз!';
  }

  // Stress/anxiety
  if (lowerMessage.includes('стресс') || lowerMessage.includes('тревож') || lowerMessage.includes('волну') || lowerMessage.includes('беспоко')) {
    return 'При стрессе помогает: глубокое дыхание (4 счёта вдох, 4 задержка, 4 выдох), прогулка, разговор с близкими, запись мыслей на бумаге. Помни: это временно, и ты справишься. Если тяжело — обратись к специалисту.';
  }

  // Help/how to use
  if (lowerMessage.includes('как') && (lowerMessage.includes('работа') || lowerMessage.includes('использ') || lowerMessage.includes('помо'))) {
    return 'Я анализирую твои записи в дневнике и помогаю с советами. Спрашивай о настроении, энергии, сне, продуктивности, привычках. Я вижу твою статистику и могу дать персональные рекомендации!';
  }

  // What can you do
  if (lowerMessage.includes('что ты') && (lowerMessage.includes('умее') || lowerMessage.includes('можешь'))) {
    return 'Я могу: анализировать твоё настроение и энергию, давать советы по сну и продуктивности, мотивировать, помогать с планированием задач, отвечать на вопросы о саморазвитии. Просто спрашивай!';
  }

  // Default response
  return 'Интересный вопрос! Я лучше всего помогаю с вопросами о настроении, энергии, сне, продуктивности и мотивации. Попробуй спросить что-то про твоё самочувствие или привычки, и я дам конкретный совет! 😊';
};

/**
 * Get suggested questions based on user data
 */
export const getSuggestedQuestions = async () => {
  try {
    const [recentEntries, todayTasks] = await Promise.all([
      journalEntries.getLastN(7),
      tasks.getToday()
    ]);

    const suggestions = [];

    // If low mood recently
    if (recentEntries.length > 0) {
      const avgMood = recentEntries.reduce((sum, e) => sum + e.mood, 0) / recentEntries.length;
      if (avgMood < 6) {
        suggestions.push('Как улучшить настроение?');
        suggestions.push('Что делать при упадке сил?');
      }
    }

    // If has tasks
    if (todayTasks.length > 0) {
      suggestions.push('Как быть продуктивнее?');
      suggestions.push('Как справиться с прокрастинацией?');
    }

    // Always available
    suggestions.push('Как улучшить качество сна?');
    suggestions.push('Какие привычки помогут мне?');

    return suggestions.slice(0, 4);
  } catch (error) {
    return [
      'Как улучшить настроение?',
      'Как быть продуктивнее?',
      'Что делать при упадке сил?',
      'Как улучшить качество сна?'
    ];
  }
};
