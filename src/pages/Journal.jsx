import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, BookOpen } from 'lucide-react';
import Button from '../components/ui/Button';
import MultiStepCheckIn from '../components/journal/MultiStepCheckIn';
import JournalCalendar from '../components/journal/JournalCalendar';
import AIInsights from '../components/journal/AIInsights';
import WeeklySummary from '../components/insights/WeeklySummary';
import MoodChart from '../components/insights/MoodChart';
import SleepChart from '../components/insights/SleepChart';
import InsightsList from '../components/insights/InsightsList';
import { journalEntries } from '../db/database';
import {
  calculateWeeklySummary,
  prepareChartData,
  generateInsights
} from '../utils/analytics';
import { useStore } from '../store/useStore';

const Journal = () => {
  const { t } = useTranslation();
  const { isPremium } = useStore();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [hasEntries, setHasEntries] = useState(false);
  const [todayEntry, setTodayEntry] = useState(null);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [period, setPeriod] = useState(7);

  useEffect(() => {
    checkTodayEntry();
    checkHasEntries();
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      loadAnalytics();
    }
  }, [period]);

  const checkTodayEntry = async () => {
    const today = new Date().toISOString().split('T')[0];
    const entry = await journalEntries.getByDate(today);
    setTodayEntry(entry);
  };

  const checkHasEntries = async () => {
    const entries = await journalEntries.getAll();
    setHasEntries(entries.length > 0);
  };

  const loadAnalytics = async () => {
    const allEntries = await journalEntries.getAll();
    setEntries(allEntries);

    if (allEntries.length > 0) {
      // Calculate summary
      const weeklySummary = calculateWeeklySummary(allEntries);
      setSummary(weeklySummary);

      // Prepare chart data
      const charts = prepareChartData(allEntries, period);
      setChartData(charts);

      // Generate insights
      const generatedInsights = generateInsights(allEntries);
      setInsights(generatedInsights);
    }
  };

  const handleSaveEntry = () => {
    setShowCheckIn(false);
    checkTodayEntry();
    checkHasEntries();
    loadAnalytics();
  };

  const handleNewEntry = () => {
    setShowCheckIn(true);
  };

  const handlePeriodChange = (days) => {
    setPeriod(days);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen p-4 pb-24"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            {t('journal.title')}
          </h1>
          {!showCheckIn && (
            <Button
              onClick={handleNewEntry}
              variant="primary"
              size="md"
            >
              <Plus size={20} />
              Создать
            </Button>
          )}
        </div>

        {/* Daily Check-in Form */}
        {showCheckIn && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MultiStepCheckIn
              existingEntry={todayEntry}
              onSave={handleSaveEntry}
              onCancel={() => setShowCheckIn(false)}
            />
          </motion.div>
        )}

        {/* Today's Entry Status */}
        {!showCheckIn && todayEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/90 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{todayEntry.moodEmoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Запись на сегодня создана</p>
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-500">
                  <span>Настроение {todayEntry.mood}/10</span>
                  <span>•</span>
                  <span>Энергия {todayEntry.energy}%</span>
                  <span>•</span>
                  <span>Сон {todayEntry.sleepHours}ч</span>
                  {(todayEntry.workoutMinutes > 0 || todayEntry.workoutCalories > 0) && (
                    <>
                      <span>•</span>
                      <span>💪 {todayEntry.workoutMinutes}мин{todayEntry.workoutCalories > 0 ? ` / ${todayEntry.workoutCalories}ккал` : ''}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!showCheckIn && !hasEntries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/30 rounded-3xl p-16 text-center shadow-lg"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-700/50 flex items-center justify-center">
                <BookOpen size={32} className="text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium mb-2">
                  {t('journal.noEntries')}
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  {t('journal.createFirst')}
                </p>
              </div>
              <Button
                onClick={handleNewEntry}
                variant="primary"
                size="lg"
              >
                <Plus size={20} />
                Создать первую запись
              </Button>
            </div>
          </motion.div>
        )}

        {/* Analytics Section - Period Selector */}
        {!showCheckIn && hasEntries && summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Аналитика</h2>
            <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => handlePeriodChange(days)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    period === days
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  {days}д
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Weekly Summary */}
        {!showCheckIn && hasEntries && summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <WeeklySummary summary={summary} />
          </motion.div>
        )}

        {/* Charts */}
        {!showCheckIn && hasEntries && chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <MoodChart data={chartData} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <SleepChart data={chartData} />
            </motion.div>
          </div>
        )}

        {/* Stats Grid */}
        {!showCheckIn && hasEntries && summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700/50 shadow-sm">
              <p className="text-3xl font-bold text-blue-500 dark:text-blue-400">{entries.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Всего записей</p>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700/50 shadow-sm">
              <p className="text-3xl font-bold text-green-500 dark:text-green-400">
                {Math.round((summary?.goodDays / summary?.totalDays) * 100) || 0}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Хороших дней</p>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700/50 shadow-sm">
              <p className="text-3xl font-bold text-purple-500 dark:text-purple-400">
                {summary?.avgMood.toFixed(1) || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Средн. настроение</p>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700/50 shadow-sm">
              <p className="text-3xl font-bold text-orange-500 dark:text-orange-400">
                {summary?.avgSleep.toFixed(1) || 0}ч
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Средн. сон</p>
            </div>
          </motion.div>
        )}

        {/* Insights List */}
        {!showCheckIn && hasEntries && insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <InsightsList insights={insights} isPremium={isPremium} />
          </motion.div>
        )}

        {/* Calendar with History */}
        {!showCheckIn && hasEntries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('journal.history')}</h2>
            <JournalCalendar onDateSelect={handleNewEntry} />
          </motion.div>
        )}

        {/* AI Insights */}
        {!showCheckIn && hasEntries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            <AIInsights latestEntry={todayEntry} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Journal;
