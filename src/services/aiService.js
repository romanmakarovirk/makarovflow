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
      suggestions: [],
      insights: []
    };
  }

  try {
    // Calculate averages
    const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
    const avgEnergy = entries.reduce((sum, e) => sum + (e.energy || 50), 0) / entries.length;
    const avgSleep = entries.reduce((sum, e) => sum + (e.sleepHours || 7), 0) / entries.length;

    // Find patterns
    const insights = [];

    // 🔮 ADD MOOD PREDICTION
    const prediction = predictTomorrowMood(entries);
    if (prediction) {
      insights.push({
        type: 'prediction',
        icon: '🔮',
        text: `Прогноз на завтра: настроение будет ${prediction.trendText} (${prediction.predictedMood}/10). Уверенность: ${prediction.confidence}%`
      });

      // Add prediction-based recommendations
      if (prediction.trend === 'declining') {
        insights.push({
          type: 'suggestion',
          icon: '💡',
          text: prediction.recommendations[0]
        });
      }
    }

    // 📊 ADD TASK-MOOD CORRELATION
    const taskCorrelation = await analyzeTaskMoodCorrelation(entries);
    if (taskCorrelation && taskCorrelation.insights) {
      insights.push(...taskCorrelation.insights);
    }

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
 * Predict tomorrow's mood based on patterns
 * Uses simple linear regression on recent data
 */
export const predictTomorrowMood = (entries) => {
  if (!entries || entries.length < 7) {
    return null; // Need at least a week of data
  }

  try {
    // Get last 14 days for better prediction
    const recentEntries = entries.slice(0, 14);

    // Calculate trend (simple linear regression)
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const n = recentEntries.length;

    recentEntries.forEach((entry, index) => {
      const x = index;
      const y = entry.mood;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next day
    const predictedMood = slope * n + intercept;

    // Calculate average sleep and energy for context
    const avgSleep = recentEntries.reduce((sum, e) => sum + (e.sleepHours || 7), 0) / n;
    const avgEnergy = recentEntries.reduce((sum, e) => sum + (e.energy || 50), 0) / n;
    const currentMood = recentEntries[0].mood;

    // Adjust prediction based on sleep and energy
    let adjustedPrediction = predictedMood;

    if (avgSleep < 7) {
      adjustedPrediction -= 0.5; // Poor sleep decreases mood
    } else if (avgSleep >= 8) {
      adjustedPrediction += 0.3; // Good sleep improves mood
    }

    if (avgEnergy < 40) {
      adjustedPrediction -= 0.5; // Low energy decreases mood
    } else if (avgEnergy >= 70) {
      adjustedPrediction += 0.3; // High energy improves mood
    }

    // Clamp to 1-10 range
    adjustedPrediction = Math.max(1, Math.min(10, adjustedPrediction));

    // Determine trend
    const moodChange = adjustedPrediction - currentMood;
    let trend = 'stable';
    let trendIcon = '➡️';
    let trendText = 'примерно таким же';

    if (moodChange > 0.5) {
      trend = 'improving';
      trendIcon = '📈';
      trendText = 'лучше';
    } else if (moodChange < -0.5) {
      trend = 'declining';
      trendIcon = '📉';
      trendText = 'немного хуже';
    }

    // Generate recommendations based on prediction
    const recommendations = [];

    if (trend === 'declining') {
      recommendations.push('Удели внимание сну и отдыху');
      recommendations.push('Запланируй что-то приятное на завтра');
      recommendations.push('Избегай стрессовых задач, если возможно');
    } else if (trend === 'improving') {
      recommendations.push('Отличный момент для сложных задач!');
      recommendations.push('Используй эту энергию продуктивно');
      recommendations.push('Поддерживай текущий режим сна и активности');
    } else {
      recommendations.push('Продолжай следить за режимом');
      recommendations.push('Добавь что-то новое в рутину');
    }

    return {
      predictedMood: Math.round(adjustedPrediction * 10) / 10,
      currentMood,
      trend,
      trendIcon,
      trendText,
      confidence: Math.min(95, 50 + (n * 3)), // Confidence increases with more data
      recommendations,
      factors: {
        avgSleep: avgSleep.toFixed(1),
        avgEnergy: avgEnergy.toFixed(0),
        dataPoints: n
      }
    };
  } catch (error) {
    console.error('Prediction error:', error);
    return null;
  }
};

/**
 * Analyze correlation between tasks completion and mood
 */
export const analyzeTaskMoodCorrelation = async (entries, tasks) => {
  if (!entries || entries.length < 7) {
    return null;
  }

  try {
    // Import tasks from database
    const { tasks: tasksDB } = await import('../db/database');
    const allTasks = await tasksDB.getAll();

    // Group entries by date and calculate task completion rate
    const dailyStats = [];

    for (const entry of entries) {
      const entryDate = entry.date;

      // Get tasks for this date
      const dateTasks = allTasks.filter(task => {
        const taskDate = task.createdAt ? task.createdAt.split('T')[0] : null;
        return taskDate === entryDate;
      });

      const completedTasks = dateTasks.filter(t => t.completed).length;
      const totalTasks = dateTasks.length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : null;

      if (completionRate !== null) {
        dailyStats.push({
          date: entryDate,
          mood: entry.mood,
          energy: entry.energy || 50,
          completionRate,
          completedTasks,
          totalTasks
        });
      }
    }

    if (dailyStats.length < 3) {
      return null; // Not enough data
    }

    // Calculate correlation between completion rate and mood
    const avgCompletionRate = dailyStats.reduce((sum, d) => sum + d.completionRate, 0) / dailyStats.length;
    const avgMood = dailyStats.reduce((sum, d) => sum + d.mood, 0) / dailyStats.length;

    // Simple correlation coefficient
    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;

    dailyStats.forEach(stat => {
      const completionDiff = stat.completionRate - avgCompletionRate;
      const moodDiff = stat.mood - avgMood;
      numerator += completionDiff * moodDiff;
      denominator1 += completionDiff * completionDiff;
      denominator2 += moodDiff * moodDiff;
    });

    const correlation = numerator / Math.sqrt(denominator1 * denominator2);

    // Find high productivity days vs low productivity days
    const highProductivity = dailyStats.filter(d => d.completionRate >= 70);
    const lowProductivity = dailyStats.filter(d => d.completionRate < 40);

    const avgMoodHighProd = highProductivity.length > 0
      ? highProductivity.reduce((sum, d) => sum + d.mood, 0) / highProductivity.length
      : null;

    const avgMoodLowProd = lowProductivity.length > 0
      ? lowProductivity.reduce((sum, d) => sum + d.mood, 0) / lowProductivity.length
      : null;

    // Generate insights
    const insights = [];

    if (correlation > 0.5) {
      insights.push({
        type: 'positive',
        icon: '✅',
        text: `Выполнение задач положительно влияет на настроение! Когда ты завершаешь задачи, настроение выше на ${((avgMoodHighProd - avgMoodLowProd) || 0).toFixed(1)} балла.`
      });
    } else if (correlation < -0.3) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        text: 'Похоже, большое количество задач снижает настроение. Возможно, стоит уменьшить нагрузку.'
      });
    }

    // Best productivity time analysis
    const morningTasks = dailyStats.filter(d => d.completedTasks > 0 && d.energy >= 60);
    const eveningTasks = dailyStats.filter(d => d.completedTasks > 0 && d.energy < 60);

    if (morningTasks.length > eveningTasks.length) {
      insights.push({
        type: 'insight',
        icon: '🌅',
        text: 'Ты продуктивнее при высокой энергии. Планируй сложные задачи на утро!'
      });
    }

    // Task overload detection
    const avgTasksPerDay = dailyStats.reduce((sum, d) => sum + d.totalTasks, 0) / dailyStats.length;
    const overloadDays = dailyStats.filter(d => d.totalTasks > avgTasksPerDay * 1.5);

    if (overloadDays.length > 0) {
      const avgMoodOverload = overloadDays.reduce((sum, d) => sum + d.mood, 0) / overloadDays.length;
      if (avgMoodOverload < avgMood - 1) {
        insights.push({
          type: 'warning',
          icon: '📊',
          text: `В дни с большим количеством задач (${Math.round(avgTasksPerDay * 1.5)}+) настроение ниже. Распределяй задачи равномернее!`
        });
      }
    }

    return {
      correlation: correlation.toFixed(2),
      avgCompletionRate: avgCompletionRate.toFixed(0),
      avgMoodHighProd: avgMoodHighProd ? avgMoodHighProd.toFixed(1) : null,
      avgMoodLowProd: avgMoodLowProd ? avgMoodLowProd.toFixed(1) : null,
      insights,
      dataPoints: dailyStats.length
    };
  } catch (error) {
    console.error('Task-mood correlation error:', error);
    return null;
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
