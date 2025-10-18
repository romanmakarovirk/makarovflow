/**
 * Analytics utilities for calculating insights from journal entries
 */

/**
 * Calculate average value from entries
 */
export const calculateAverage = (entries, field) => {
  if (!entries || entries.length === 0) return 0;
  const sum = entries.reduce((acc, entry) => acc + (entry[field] || 0), 0);
  return Math.round((sum / entries.length) * 10) / 10;
};

/**
 * Get last N days of entries
 */
export const getLastNDays = (entries, days) => {
  const today = new Date();
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= cutoffDate;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Count entries by mood threshold
 */
export const countGoodDays = (entries, threshold = 7) => {
  return entries.filter(entry => entry.mood >= threshold).length;
};

/**
 * Calculate mood trend (improving, stable, declining)
 */
export const calculateMoodTrend = (entries) => {
  if (entries.length < 3) return 'stable';

  const firstHalf = entries.slice(0, Math.floor(entries.length / 2));
  const secondHalf = entries.slice(Math.floor(entries.length / 2));

  const firstAvg = calculateAverage(firstHalf, 'mood');
  const secondAvg = calculateAverage(secondHalf, 'mood');

  const diff = secondAvg - firstAvg;

  if (diff > 1) return 'improving';
  if (diff < -1) return 'declining';
  return 'stable';
};

/**
 * Find correlation between two fields
 */
export const calculateCorrelation = (entries, field1, field2) => {
  if (entries.length < 5) return 0;

  const values1 = entries.map(e => e[field1] || 0);
  const values2 = entries.map(e => e[field2] || 0);

  const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
  const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;

  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;

  for (let i = 0; i < values1.length; i++) {
    const diff1 = values1[i] - mean1;
    const diff2 = values2[i] - mean2;
    numerator += diff1 * diff2;
    denominator1 += diff1 * diff1;
    denominator2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(denominator1 * denominator2);

  if (denominator === 0) return 0;

  return Math.round((numerator / denominator) * 100) / 100;
};

/**
 * Analyze tag patterns
 */
export const analyzeTagPatterns = (entries) => {
  const tagCounts = {};
  const tagMoods = {};

  entries.forEach(entry => {
    if (entry.tags && entry.tags.length > 0) {
      entry.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        if (!tagMoods[tag]) tagMoods[tag] = [];
        tagMoods[tag].push(entry.mood);
      });
    }
  });

  // Calculate average mood for each tag
  const tagAnalysis = Object.keys(tagCounts).map(tag => ({
    tag,
    count: tagCounts[tag],
    avgMood: Math.round(
      (tagMoods[tag].reduce((a, b) => a + b, 0) / tagMoods[tag].length) * 10
    ) / 10
  }));

  return tagAnalysis.sort((a, b) => b.count - a.count);
};

/**
 * Generate insights based on patterns
 */
export const generateInsights = (entries) => {
  if (entries.length < 3) {
    return [{
      type: 'info',
      icon: '📊',
      message: 'Создай больше записей для получения инсайтов'
    }];
  }

  const insights = [];

  // Sleep analysis
  const avgSleep = calculateAverage(entries, 'sleepHours');
  if (avgSleep < 7) {
    insights.push({
      type: 'warning',
      icon: '😴',
      message: `Ты спишь в среднем ${avgSleep}ч - это меньше нормы. Недосып может влиять на настроение.`
    });
  } else if (avgSleep >= 8) {
    insights.push({
      type: 'success',
      icon: '✨',
      message: `Отлично! Ты спишь ${avgSleep}ч в среднем - это здорово для твоего самочувствия.`
    });
  }

  // Sleep-mood correlation
  const sleepMoodCorr = calculateCorrelation(entries, 'sleepHours', 'mood');
  if (sleepMoodCorr > 0.5) {
    insights.push({
      type: 'info',
      icon: '🛌',
      message: 'Качество сна сильно влияет на твоё настроение. Старайся высыпаться!'
    });
  }

  // Energy analysis
  const avgEnergy = calculateAverage(entries, 'energy');
  if (avgEnergy < 40) {
    insights.push({
      type: 'warning',
      icon: '🔋',
      message: 'Твой уровень энергии низкий. Попробуй больше двигаться и гулять на свежем воздухе.'
    });
  }

  // Mood trend
  const trend = calculateMoodTrend(entries);
  if (trend === 'improving') {
    insights.push({
      type: 'success',
      icon: '📈',
      message: 'Отличная новость! Твоё настроение улучшается с каждым днём.'
    });
  } else if (trend === 'declining') {
    insights.push({
      type: 'warning',
      icon: '📉',
      message: 'Кажется, твоё настроение ухудшается. Возможно, стоит уделить больше внимания отдыху.'
    });
  }

  // Tag analysis
  const tagPatterns = analyzeTagPatterns(entries);

  // Find tags associated with good mood
  const goodMoodTags = tagPatterns.filter(t => t.avgMood >= 7 && t.count >= 2);
  if (goodMoodTags.length > 0) {
    const topTag = goodMoodTags[0];
    insights.push({
      type: 'success',
      icon: '🎯',
      message: `Активность "${topTag.tag}" положительно влияет на твоё настроение!`
    });
  }

  // Find tags associated with bad mood
  const badMoodTags = tagPatterns.filter(t => t.avgMood < 5 && t.count >= 2);
  if (badMoodTags.length > 0) {
    const topBadTag = badMoodTags[0];
    insights.push({
      type: 'warning',
      icon: '⚠️',
      message: `Похоже, "${topBadTag.tag}" негативно влияет на твоё состояние.`
    });
  }

  // Check outdoor activity
  const outdoorEntries = entries.filter(e =>
    e.tags && e.tags.includes('walked_outside')
  );
  if (outdoorEntries.length < entries.length * 0.3) {
    insights.push({
      type: 'info',
      icon: '🌳',
      message: 'Попробуй чаще выходить на улицу - это улучшает настроение и энергию.'
    });
  }

  // Check exercise
  const exerciseEntries = entries.filter(e =>
    e.tags && e.tags.includes('exercised')
  );
  if (exerciseEntries.length > 0) {
    const avgExerciseMood = calculateAverage(exerciseEntries, 'mood');
    const avgOtherMood = calculateAverage(
      entries.filter(e => !e.tags || !e.tags.includes('exercised')),
      'mood'
    );
    if (avgExerciseMood > avgOtherMood + 1) {
      insights.push({
        type: 'success',
        icon: '💪',
        message: 'Спорт явно помогает тебе чувствовать себя лучше!'
      });
    }
  }

  // Check stress
  const stressEntries = entries.filter(e =>
    e.tags && e.tags.includes('felt_stressed')
  );
  if (stressEntries.length > entries.length * 0.4) {
    insights.push({
      type: 'warning',
      icon: '😰',
      message: 'Ты часто испытываешь стресс. Постарайся найти способы расслабления.'
    });
  }

  return insights;
};

/**
 * Calculate weekly summary statistics
 */
export const calculateWeeklySummary = (entries) => {
  const lastWeek = getLastNDays(entries, 7);

  return {
    avgMood: calculateAverage(lastWeek, 'mood'),
    avgSleep: calculateAverage(lastWeek, 'sleepHours'),
    avgEnergy: calculateAverage(lastWeek, 'energy'),
    avgSleepQuality: calculateAverage(lastWeek, 'sleepQuality'),
    goodDays: countGoodDays(lastWeek, 7),
    totalDays: lastWeek.length,
    trend: calculateMoodTrend(lastWeek),
    entries: lastWeek
  };
};

/**
 * Prepare data for charts
 */
export const prepareChartData = (entries, days = 7) => {
  const lastDays = getLastNDays(entries, days);

  return lastDays.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    }),
    mood: entry.mood,
    sleep: entry.sleepHours,
    energy: entry.energy,
    sleepQuality: entry.sleepQuality
  }));
};
