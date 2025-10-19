/**
 * AI Chat Service for MakarovFlow
 * Smart context-aware responses
 */

import { journalEntries, tasks, homework, settings } from '../db/database';

/**
 * Parse context string into structured data
 */
const parseContext = (contextString) => {
  const lines = contextString.split('\n');
  const data = {
    hasMoodData: false,
    avgMood: 0,
    avgEnergy: 0,
    avgSleep: 0,
    latestMood: 0,
    latestEnergy: 0,
    latestSleep: 0,
    tasksCount: 0,
    homeworkCount: 0
  };

  lines.forEach(line => {
    if (line.includes('Настроение:')) {
      const match = line.match(/(\d+)\/10/);
      if (match) {
        data.latestMood = parseInt(match[1]);
        data.hasMoodData = true;
      }
    }
    if (line.includes('Энергия:')) {
      const match = line.match(/(\d+)%/);
      if (match) data.latestEnergy = parseInt(match[1]);
    }
    if (line.includes('Сон:')) {
      const match = line.match(/(\d+\.?\d*) часов/);
      if (match) data.latestSleep = parseFloat(match[1]);
    }
    if (line.includes('Среднее настроение:')) {
      const match = line.match(/(\d+\.?\d*)\/10/);
      if (match) data.avgMood = parseFloat(match[1]);
    }
    if (line.includes('Средняя энергия:')) {
      const match = line.match(/(\d+)%/);
      if (match) data.avgEnergy = parseInt(match[1]);
    }
    if (line.includes('Средний сон:')) {
      const match = line.match(/(\d+\.?\d*) часов/);
      if (match) data.avgSleep = parseFloat(match[1]);
    }
    if (line.includes('Задачи на сегодня')) {
      const match = line.match(/\((\d+)\)/);
      if (match) data.tasksCount = parseInt(match[1]);
    }
    if (line.includes('Активные домашние задания')) {
      const match = line.match(/\((\d+)\)/);
      if (match) data.homeworkCount = parseInt(match[1]);
    }
  });

  return data;
};

/**
 * Generate personalized mood analysis
 */
const generateMoodAnalysis = (data) => {
  let response = '📊 **Вот твоя статистика:**\n\n';

  if (data.hasMoodData) {
    // Latest status
    response += `**Последнее состояние:**\n`;
    response += `• Настроение: ${data.latestMood}/10 ${getMoodEmoji(data.latestMood)}\n`;
    response += `• Энергия: ${data.latestEnergy}% ${getEnergyEmoji(data.latestEnergy)}\n`;
    response += `• Сон: ${data.latestSleep}ч ${getSleepEmoji(data.latestSleep)}\n\n`;

    // Average
    if (data.avgMood > 0) {
      response += `**Средние показатели (неделя):**\n`;
      response += `• Настроение: ${data.avgMood.toFixed(1)}/10\n`;
      response += `• Энергия: ${data.avgEnergy}%\n`;
      response += `• Сон: ${data.avgSleep.toFixed(1)}ч\n\n`;
    }

    // Analysis
    response += `**Рекомендации:**\n`;

    if (data.avgMood < 5) {
      response += '❤️ Твоё настроение последнюю неделю было низким. Попробуй больше гулять, общаться с друзьями, заниматься любимыми делами.\n';
    } else if (data.avgMood < 7) {
      response += '💛 Неплохо, но есть куда расти! Добавь больше радости в каждый день.\n';
    } else {
      response += '💚 Отлично! Ты в хорошем настроении. Продолжай в том же духе!\n';
    }

    if (data.avgEnergy < 40) {
      response += '⚡ Низкая энергия. Высыпайся (7-8ч), двигайся больше, пей воду.\n';
    }

    if (data.avgSleep < 7) {
      response += '😴 Ты мало спишь! Старайся спать минимум 7-8 часов.\n';
    } else if (data.avgSleep > 9) {
      response += '🛏 Много сна — тоже не очень. 7-8 часов оптимально.\n';
    }
  }

  if (data.tasksCount > 0) {
    response += `\n📝 У тебя ${data.tasksCount} задач на сегодня. Не забудь их выполнить!`;
  }

  if (data.homeworkCount > 0) {
    response += `\n📚 ${data.homeworkCount} домашних заданий ждут тебя.`;
  }

  return response;
};

const getMoodEmoji = (mood) => {
  if (mood >= 8) return '😊';
  if (mood >= 6) return '🙂';
  if (mood >= 4) return '😐';
  return '😔';
};

const getEnergyEmoji = (energy) => {
  if (energy >= 70) return '⚡';
  if (energy >= 40) return '🔋';
  return '🪫';
};

const getSleepEmoji = (sleep) => {
  if (sleep >= 7 && sleep <= 9) return '✅';
  if (sleep < 6) return '⚠️';
  return '💤';
};

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

    // Try to use OpenRouter API with Claude
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (apiKey && apiKey !== '' && apiKey !== 'your_api_key_here') {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'MindFlow App'
          },
          body: JSON.stringify({
            model: 'anthropic/claude-3.5-sonnet',
            messages: [
              {
                role: 'system',
                content: `Ты — персональный AI-помощник в приложении MindFlow. Твоя задача — помогать пользователю с анализом настроения, продуктивностью, привычками и мотивацией. Отвечай на русском языке, будь эмпатичным, поддерживающим и конкретным в советах.

${context}

Давай практичные советы, основанные на данных пользователя. Будь кратким, но полезным (2-4 предложения).`
              },
              ...conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content
              })),
              {
                role: 'user',
                content: userMessage
              }
            ],
            max_tokens: 500,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        const aiMessage = data.choices?.[0]?.message?.content;

        if (aiMessage) {
          return {
            success: true,
            message: aiMessage
          };
        }
      } catch (apiError) {
        console.error('OpenRouter API error:', apiError);
        // Fall back to local responses if API fails
      }
    }

    // Fallback to smart local responses if no API key or API fails
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
 * Generate smart response based on keywords and context
 */
const generateFallbackResponse = (userMessage, context) => {
  const lowerMessage = userMessage.toLowerCase();

  // Extract context data
  const contextData = parseContext(context);

  // Analyze mood trends
  if (contextData.hasMoodData && (lowerMessage.includes('анализ') || lowerMessage.includes('статистик') || lowerMessage.includes('как дела'))) {
    return generateMoodAnalysis(contextData);
  }

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
