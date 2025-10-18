/**
 * AI Service for mood analysis using Hugging Face Inference API
 * Free tier: No API key required for some models
 */

// Hugging Face Inference API endpoint
const HF_API_URL = 'https://api-inference.huggingface.co/models';

/**
 * Analyze mood from journal entry text
 * Uses a free sentiment analysis model
 */
export const analyzeMoodFromText = async (text) => {
  if (!text || text.trim().length === 0) {
    return null;
  }

  try {
    // Using a multilingual sentiment model that supports Russian
    const response = await fetch(`${HF_API_URL}/cardiffnlp/twitter-xlm-roberta-base-sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text,
        options: { wait_for_model: true }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();

    // Result format: [{ label: 'positive', score: 0.9 }, ...]
    if (Array.isArray(result) && result.length > 0) {
      const sentiment = result[0];

      // Map sentiment to mood score (1-10)
      let moodScore = 5; // neutral default

      sentiment.forEach(item => {
        if (item.label === 'positive') {
          moodScore = Math.round(5 + (item.score * 5)); // 5-10
        } else if (item.label === 'negative') {
          moodScore = Math.round(5 - (item.score * 5)); // 0-5
        }
      });

      return {
        score: Math.max(1, Math.min(10, moodScore)),
        sentiment: sentiment[0].label,
        confidence: sentiment[0].score
      };
    }

    return null;
  } catch (error) {
    console.error('AI mood analysis failed:', error);
    return null;
  }
};

/**
 * Generate insights from journal entries
 * Analyzes patterns in mood, energy, and sleep
 */
export const generateInsights = async (entries) => {
  if (!entries || entries.length === 0) {
    return {
      summary: 'Недостаточно данных для анализа',
      suggestions: []
    };
  }

  try {
    // Calculate averages
    const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
    const avgEnergy = entries.reduce((sum, e) => sum + (e.energy || 50), 0) / entries.length;
    const avgSleep = entries.reduce((sum, e) => sum + (e.sleepHours || 7), 0) / entries.length;

    // Find patterns
    const insights = [];

    // Mood insights
    if (avgMood >= 8) {
      insights.push({
        type: 'positive',
        icon: '😊',
        text: 'Отличное настроение! Продолжай в том же духе!'
      });
    } else if (avgMood <= 4) {
      insights.push({
        type: 'warning',
        icon: '💙',
        text: 'Замечаю, что настроение не очень. Попробуй больше отдыхать и заниматься любимыми делами.'
      });
    }

    // Energy insights
    if (avgEnergy < 40) {
      insights.push({
        type: 'suggestion',
        icon: '⚡',
        text: 'Низкий уровень энергии. Рекомендую больше двигаться, пить воду и высыпаться.'
      });
    }

    // Sleep insights
    if (avgSleep < 7) {
      insights.push({
        type: 'warning',
        icon: '😴',
        text: `Среднее время сна: ${avgSleep.toFixed(1)}ч. Старайся спать минимум 7-8 часов.`
      });
    } else if (avgSleep >= 8) {
      insights.push({
        type: 'positive',
        icon: '✨',
        text: 'Отличный режим сна! Это положительно влияет на настроение и энергию.'
      });
    }

    // Correlation between sleep and mood
    const goodSleepDays = entries.filter(e => e.sleepHours >= 7);
    const badSleepDays = entries.filter(e => e.sleepHours < 7);

    if (goodSleepDays.length > 0 && badSleepDays.length > 0) {
      const avgMoodGoodSleep = goodSleepDays.reduce((sum, e) => sum + e.mood, 0) / goodSleepDays.length;
      const avgMoodBadSleep = badSleepDays.reduce((sum, e) => sum + e.mood, 0) / badSleepDays.length;

      if (avgMoodGoodSleep - avgMoodBadSleep > 1.5) {
        insights.push({
          type: 'insight',
          icon: '🔍',
          text: `Когда ты высыпаешься, настроение в среднем на ${(avgMoodGoodSleep - avgMoodBadSleep).toFixed(1)} балла выше!`
        });
      }
    }

    // Weekly trend
    if (entries.length >= 7) {
      const recentMood = entries.slice(0, 3).reduce((sum, e) => sum + e.mood, 0) / 3;
      const olderMood = entries.slice(-3).reduce((sum, e) => sum + e.mood, 0) / 3;

      if (recentMood > olderMood + 1) {
        insights.push({
          type: 'positive',
          icon: '📈',
          text: 'Твоё настроение улучшается! Продолжай следить за собой.'
        });
      } else if (recentMood < olderMood - 1) {
        insights.push({
          type: 'warning',
          icon: '📉',
          text: 'Заметил ухудшение настроения. Может, стоит взять небольшой перерыв и отдохнуть?'
        });
      }
    }

    return {
      summary: `Среднее настроение: ${avgMood.toFixed(1)}/10 • Энергия: ${avgEnergy.toFixed(0)}% • Сон: ${avgSleep.toFixed(1)}ч`,
      avgMood,
      avgEnergy,
      avgSleep,
      insights
    };
  } catch (error) {
    console.error('Failed to generate insights:', error);
    return {
      summary: 'Не удалось сгенерировать инсайты',
      insights: []
    };
  }
};

/**
 * Get mood recommendation based on current state
 */
export const getMoodRecommendation = (mood, energy, sleepHours) => {
  const recommendations = [];

  // Low mood recommendations
  if (mood <= 4) {
    recommendations.push({
      title: 'Поднять настроение',
      icon: '🌟',
      suggestions: [
        'Послушай любимую музыку',
        'Прогуляйся на свежем воздухе',
        'Позвони другу или близкому человеку',
        'Займись любимым хобби',
        'Посмотри что-то смешное'
      ]
    });
  }

  // Low energy recommendations
  if (energy < 40) {
    recommendations.push({
      title: 'Повысить энергию',
      icon: '⚡',
      suggestions: [
        'Сделай лёгкую зарядку или растяжку',
        'Выпей стакан воды',
        'Сделай перерыв и подыши свежим воздухом',
        'Перекуси чем-то полезным',
        'Вздремни 15-20 минут'
      ]
    });
  }

  // Poor sleep recommendations
  if (sleepHours < 7) {
    recommendations.push({
      title: 'Улучшить сон',
      icon: '😴',
      suggestions: [
        'Ложись спать в одно и то же время',
        'Избегай гаджетов за час до сна',
        'Проветри комнату перед сном',
        'Попробуй медитацию или дыхательные упражнения',
        'Почитай книгу перед сном'
      ]
    });
  }

  // Good state - positive reinforcement
  if (mood >= 8 && energy >= 70 && sleepHours >= 7) {
    recommendations.push({
      title: 'Ты в отличной форме!',
      icon: '🎉',
      suggestions: [
        'Используй эту энергию для важных дел',
        'Поделись позитивом с окружающими',
        'Запомни, что помогло тебе достичь этого состояния',
        'Сделай что-то новое и интересное'
      ]
    });
  }

  return recommendations;
};

/**
 * Simple local sentiment analysis (fallback without API)
 * Analyzes Russian text for positive/negative keywords
 */
export const simpleLocalSentimentAnalysis = (text) => {
  if (!text) return { score: 5, sentiment: 'neutral' };

  const positiveWords = [
    'хорошо', 'отлично', 'прекрасно', 'замечательно', 'счастлив', 'рад',
    'весело', 'круто', 'супер', 'классно', 'здорово', 'радость', 'любовь',
    'успех', 'победа', 'мотивация', 'энергия', 'позитив', 'улыбка'
  ];

  const negativeWords = [
    'плохо', 'ужасно', 'грустно', 'печально', 'устал', 'злой', 'раздражён',
    'скучно', 'боль', 'проблема', 'стресс', 'тревога', 'депрессия', 'страх',
    'одиноко', 'разочарован', 'провал', 'ошибка', 'неудача'
  ];

  const lowerText = text.toLowerCase();

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });

  // Calculate score
  const total = positiveCount + negativeCount;
  if (total === 0) {
    return { score: 5, sentiment: 'neutral', confidence: 0.5 };
  }

  const positiveRatio = positiveCount / total;
  const score = Math.round(1 + (positiveRatio * 9)); // 1-10 scale

  return {
    score,
    sentiment: score >= 7 ? 'positive' : score <= 4 ? 'negative' : 'neutral',
    confidence: Math.abs(positiveCount - negativeCount) / total
  };
};
