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
      journalEntries.getLastN(14), // Увеличил до 14 дней для прогноза
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

      // 🔮 ADD PREDICTION TO CONTEXT
      if (recentEntries.length >= 7) {
        const { predictTomorrowMood } = await import('./aiService');
        const prediction = predictTomorrowMood(recentEntries);
        if (prediction) {
          context += `\nПрогноз настроения на завтра:
- Прогнозируемое настроение: ${prediction.predictedMood}/10 (${prediction.trendText})
- Тренд: ${prediction.trendIcon}
- Уверенность прогноза: ${prediction.confidence}%\n`;
        }
      }

      // 📊 ADD TASK CORRELATION TO CONTEXT
      if (recentEntries.length >= 7) {
        const { analyzeTaskMoodCorrelation } = await import('./aiService');
        const correlation = await analyzeTaskMoodCorrelation(recentEntries);
        if (correlation && correlation.correlation) {
          context += `\nСвязь задач и настроения:
- Корреляция: ${correlation.correlation > 0.5 ? 'положительная' : correlation.correlation < -0.3 ? 'отрицательная' : 'нейтральная'}
- Средний процент выполнения задач: ${correlation.avgCompletionRate}%\n`;
        }
      }
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

    // Try to use free Hugging Face API (no credit card needed!)
    try {
      // Используем бесплатную модель Mistral-7B через Hugging Face Inference API
      const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `<s>[INST] Ты персональный AI-помощник в приложении MindFlow для студентов. Помогай с настроением, продуктивностью, мотивацией. Отвечай ТОЛЬКО на русском языке, кратко (2-3 предложения), эмпатично.

${context}

Вопрос пользователя: ${userMessage} [/INST]`,
          parameters: {
            max_new_tokens: 250,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        let aiMessage = '';

        if (Array.isArray(data) && data[0]?.generated_text) {
          aiMessage = data[0].generated_text.trim();
        } else if (data.generated_text) {
          aiMessage = data.generated_text.trim();
        }

        // Если получили ответ на английском или странный, используем fallback
        if (aiMessage && aiMessage.length > 10 && !aiMessage.includes('[/INST]')) {
          // Переводим на русский если нужно и очищаем
          aiMessage = aiMessage.replace(/\[INST\].*?\[\/INST\]/g, '').trim();

          return {
            success: true,
            message: aiMessage
          };
        }
      }
    } catch (apiError) {
      console.log('Hugging Face API error, using fallback:', apiError.message);
    }

    // Fallback to smart local responses
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
 * Generate advanced contextual response using AI-like logic
 */
const generateSmartResponse = (userMessage, contextData) => {
  const lowerMessage = userMessage.toLowerCase();

  // Анализ настроения с персонализацией
  if (contextData.hasMoodData) {
    const moodTrend = contextData.avgMood;
    const energyTrend = contextData.avgEnergy;
    const sleepQuality = contextData.avgSleep;

    // Персональные ответы на основе данных
    if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуй') || lowerMessage.includes('hi')) {
      if (moodTrend < 5) {
        return `Привет! Вижу, что твоё настроение последнее время было ${moodTrend.toFixed(1)}/10. Хочешь поговорить о том, что беспокоит? Я могу помочь разобраться и дать советы! 💙`;
      } else if (moodTrend >= 7) {
        return `Привет! Рад видеть, что у тебя отличное настроение (${moodTrend.toFixed(1)}/10)! Чем могу помочь сегодня? 😊`;
      } else {
        return `Привет! Твоё настроение держится на уровне ${moodTrend.toFixed(1)}/10. Давай сделаем день ещё лучше! О чём хочешь поговорить? ✨`;
      }
    }

    if (lowerMessage.includes('как дела') || lowerMessage.includes('что нового')) {
      let response = '📊 Вот твоя статистика:\n\n';
      response += `🎭 Настроение: ${moodTrend.toFixed(1)}/10 ${moodTrend >= 7 ? '(отлично!)' : moodTrend >= 5 ? '(неплохо)' : '(можно лучше)'}\n`;
      response += `⚡ Энергия: ${energyTrend}% ${energyTrend >= 60 ? '(хорошо!)' : '(нужно больше отдыха)'}\n`;
      response += `😴 Сон: ${sleepQuality.toFixed(1)}ч ${sleepQuality >= 7 ? '(отлично!)' : '(маловато)'}\n\n`;

      // Умные рекомендации
      if (energyTrend < 40) {
        response += '💡 Совет: Твоя энергия низкая. Попробуй прогуляться 15 минут или сделать лёгкую зарядку!';
      } else if (sleepQuality < 7) {
        response += '💡 Совет: Спи хотя бы 7-8 часов! Это сильно улучшит настроение и продуктивность.';
      } else if (moodTrend < 6) {
        response += '💡 Совет: Попробуй записать 3 вещи, за которые ты благодарен сегодня. Это помогает!';
      } else {
        response += '💡 Ты молодец! Продолжай в том же духе! 🌟';
      }

      return response;
    }
  }

  // 🔮 PREDICTION QUESTIONS
  if (lowerMessage.includes('прогноз') || lowerMessage.includes('завтра') || lowerMessage.includes('предскаж')) {
    if (contextData.hasMoodData) {
      // Get prediction from context
      const lines = context.split('\n');
      const predictionLine = lines.find(l => l.includes('Прогнозируемое настроение'));
      if (predictionLine) {
        const match = predictionLine.match(/(\d+\.?\d*)\/10 \((.+?)\)/);
        if (match) {
          const score = parseFloat(match[1]);
          const trend = match[2];

          let response = `🔮 **Прогноз на завтра:**\n\n`;
          response += `Твоё настроение завтра будет **${trend}** (${score}/10).\n\n`;

          if (score < contextData.latestMood - 0.5) {
            response += `📉 Я вижу возможное снижение. **Что делать:**\n`;
            response += `• Ложись спать пораньше сегодня\n`;
            response += `• Запланируй что-то приятное на утро\n`;
            response += `• Не перегружай себя задачами завтра\n`;
          } else if (score > contextData.latestMood + 0.5) {
            response += `📈 Отличные новости! **Как использовать:**\n`;
            response += `• Идеальный день для сложных задач!\n`;
            response += `• Займись тем, что откладывал\n`;
            response += `• Продолжай в том же духе с режимом\n`;
          } else {
            response += `➡️ Стабильное состояние. Продолжай следить за режимом сна и активности!`;
          }

          return response;
        }
      }
    }
    return '🔮 Для точного прогноза мне нужно минимум 7 дней записей в дневнике. Продолжай записывать своё состояние каждый день!';
  }

  // 📊 TASK CORRELATION QUESTIONS
  if (lowerMessage.includes('задач') && (lowerMessage.includes('влия') || lowerMessage.includes('связ') || lowerMessage.includes('настроен'))) {
    const lines = context.split('\n');
    const correlationLine = lines.find(l => l.includes('Корреляция:'));
    const completionLine = lines.find(l => l.includes('Средний процент выполнения'));

    if (correlationLine && completionLine) {
      const isPositive = correlationLine.includes('положительная');
      const isNegative = correlationLine.includes('отрицательная');
      const completionMatch = completionLine.match(/(\d+)%/);
      const completion = completionMatch ? completionMatch[1] : '?';

      let response = `📊 **Анализ задач и настроения:**\n\n`;

      if (isPositive) {
        response += `✅ Выполнение задач **положительно влияет** на твоё настроение!\n\n`;
        response += `Когда ты выполняешь задачи, настроение становится лучше. Ты в среднем выполняешь **${completion}%** задач.\n\n`;
        response += `**Совет:** Начинай день с маленькой задачи, чтобы запустить позитивный momentum!`;
      } else if (isNegative) {
        response += `⚠️ Похоже, большое количество задач **снижает** настроение.\n\n`;
        response += `Возможно, ты берёшь слишком много на себя. Средний процент выполнения: **${completion}%**.\n\n`;
        response += `**Совет:** Уменьши количество задач на день. Лучше 3 выполненных, чем 10 незавершённых!`;
      } else {
        response += `➡️ Связь между задачами и настроением **нейтральная**.\n\n`;
        response += `Твой процент выполнения: **${completion}%**. Задачи не сильно влияют на настроение.\n\n`;
        response += `**Совет:** Фокусируйся на задачах, которые тебе действительно интересны!`;
      }

      return response;
    }

    return '📊 Для анализа связи задач и настроения нужно больше данных. Заполняй дневник и отмечай выполненные задачи!';
  }

  // Умные ответы на частые вопросы
  if (lowerMessage.includes('мотивац') || lowerMessage.includes('не хочу') || lowerMessage.includes('лень')) {
    const tips = [
      '🎯 Правило 2 минут: если задача займёт меньше 2 минут - сделай её СЕЙЧАС!',
      '🔥 Начни с самого маленького шага. Даже 5 минут работы запустят momentum!',
      '💪 Мотивация приходит ПОСЛЕ действия, а не до него. Просто начни!',
      '📝 Раздели большую задачу на крошечные шаги. Съешь слона по кусочкам!',
      '⏰ Техника Pomodoro: 25 минут работы, 5 минут отдых. Попробуй!'
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  if (lowerMessage.includes('стресс') || lowerMessage.includes('тревож') || lowerMessage.includes('волну')) {
    return '🧘 Попробуй технику дыхания "4-7-8":\n\n1️⃣ Вдох на 4 счёта\n2️⃣ Задержка на 7 счётов\n3️⃣ Выдох на 8 счётов\n\nПовтори 3-4 раза. Это активирует парасимпатическую нервную систему и снижает стресс. Работает научно доказано! 💙';
  }

  if (lowerMessage.includes('сон') || lowerMessage.includes('бессонн') || lowerMessage.includes('не сплю')) {
    return '😴 Для крепкого сна:\n\n✅ Ложись в одно время\n✅ Никаких гаджетов за час до сна\n✅ Проветри комнату (18-20°C идеально)\n✅ Попробуй медитацию или чтение\n✅ Избегай кофеина после 15:00\n\nТвой мозг скажет спасибо! 🌙';
  }

  if (lowerMessage.includes('продуктивн') || lowerMessage.includes('работ') || lowerMessage.includes('учёб')) {
    return '📚 Лайфхаки продуктивности:\n\n🎯 Съешь лягушку утром (самое сложное дело первым)\n⏰ Pomodoro: 25 мин работы / 5 мин отдых\n📵 Отключи уведомления при концентрации\n✅ Не больше 3 главных задач на день\n🎵 Попробуй фоновый белый шум или lo-fi\n\nМаленькие шаги → большие результаты! 🚀';
  }

  if (lowerMessage.includes('энерги') || lowerMessage.includes('устал') || lowerMessage.includes('сил нет')) {
    return '⚡ Подзарядка энергии:\n\n💧 Выпей воды (обезвоживание = усталость)\n🚶 Прогулка 10-15 минут на свежем воздухе\n🥗 Перекуси чем-то полезным (орехи, фрукты)\n🧘 5 минут растяжки или лёгкой зарядки\n☀️ Больше дневного света\n\nТвоё тело - твой инструмент! Заботься о нём 💪';
  }

  return null; // Вернёт null если нет подходящего умного ответа
};

/**
 * Generate smart response based on keywords and context
 */
const generateFallbackResponse = (userMessage, context) => {
  const lowerMessage = userMessage.toLowerCase();

  // Extract context data
  const contextData = parseContext(context);

  // Попробовать умный ответ на основе контекста
  const smartResponse = generateSmartResponse(userMessage, contextData);
  if (smartResponse) return smartResponse;

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
      journalEntries.getLastN(14),
      tasks.getToday()
    ]);

    const suggestions = [];

    // 🔮 ALWAYS SHOW PREDICTION if enough data
    if (recentEntries.length >= 7) {
      suggestions.push('Какой прогноз настроения на завтра?');
    }

    // 📊 SHOW TASK CORRELATION if has tasks and entries
    if (recentEntries.length >= 7 && todayTasks.length > 0) {
      suggestions.push('Как задачи влияют на моё настроение?');
    }

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
    if (suggestions.length < 4) {
      suggestions.push('Как улучшить качество сна?');
      suggestions.push('Какие привычки помогут мне?');
    }

    return suggestions.slice(0, 4);
  } catch (error) {
    return [
      'Какой прогноз настроения на завтра?',
      'Как задачи влияют на моё настроение?',
      'Как быть продуктивнее?',
      'Как улучшить качество сна?'
    ];
  }
};
