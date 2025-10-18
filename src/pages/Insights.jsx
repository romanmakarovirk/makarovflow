import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BarChart3, Calendar } from 'lucide-react';
import WeeklySummary from '../components/insights/WeeklySummary';
import MoodChart from '../components/insights/MoodChart';
import SleepChart from '../components/insights/SleepChart';
import InsightsList from '../components/insights/InsightsList';
import Button from '../components/ui/Button';
import { journalEntries } from '../db/database';
import {
  calculateWeeklySummary,
  prepareChartData,
  generateInsights
} from '../utils/analytics';
import { useStore } from '../store/useStore';

const Insights = () => {
  const { t } = useTranslation();
  const { isPremium } = useStore();
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [period, setPeriod] = useState(7); // days

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
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

  const handlePeriodChange = (days) => {
    setPeriod(days);
  };

  // Empty state
  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen p-4 pb-24"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-400 to-teal-600 bg-clip-text text-transparent">
            {t('insights.title')}
          </h1>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-teal-600/20 flex items-center justify-center">
                <BarChart3 size={40} className="text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-lg font-medium mb-2">
                  {t('insights.noData')}
                </p>
                <p className="text-gray-500 text-sm">
                  {t('insights.createEntries')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen p-4 pb-24"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-600 bg-clip-text text-transparent">
            {t('insights.title')}
          </h1>

          {/* Period selector */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => handlePeriodChange(days)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  period === days
                    ? 'bg-green-500 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {days}д
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Summary */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <WeeklySummary summary={summary} />
          </motion.div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MoodChart data={chartData} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SleepChart data={chartData} />
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <InsightsList insights={insights} isPremium={isPremium} />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{entries.length}</p>
            <p className="text-sm text-gray-400 mt-1">Всего записей</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">
              {Math.round((summary?.goodDays / summary?.totalDays) * 100) || 0}%
            </p>
            <p className="text-sm text-gray-400 mt-1">Хороших дней</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">
              {summary?.avgMood.toFixed(1) || 0}
            </p>
            <p className="text-sm text-gray-400 mt-1">Средн. настроение</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-400">
              {summary?.avgSleep.toFixed(1) || 0}ч
            </p>
            <p className="text-sm text-gray-400 mt-1">Средн. сон</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Insights;
