import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, BookOpen, TrendingUp, Moon, Zap, Heart, BarChart3, GraduationCap, Calendar, BookCheck, Calculator } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import MultiStepCheckIn from '../components/journal/MultiStepCheckIn';
import JournalCalendar from '../components/journal/JournalCalendar';
import AIInsights from '../components/journal/AIInsights';
import ScheduleManager from '../components/study/ScheduleManager';
import HomeworkManager from '../components/study/HomeworkManager';
import GPACalculator from '../components/study/GPACalculator';
import { journalEntries, userStats, schedule, homework } from '../db/database';
import { calculateWeeklySummary } from '../utils/analytics';
import { haptic } from '../utils/telegram';

const Journal = () => {
  const { t } = useTranslation();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [hasEntries, setHasEntries] = useState(false);
  const [todayEntry, setTodayEntry] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showHomework, setShowHomework] = useState(false);
  const [showGPA, setShowGPA] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  const [homeworkData, setHomeworkData] = useState([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await Promise.all([
      checkTodayEntry(),
      checkHasEntries(),
      loadAnalytics(),
      loadStats(),
      loadSchedule(),
      loadHomework()
    ]);
  };

  const loadSchedule = async () => {
    const today = new Date().getDay();
    const items = await schedule.getByDay(today);
    setScheduleData(items);
  };

  const loadHomework = async () => {
    const items = await homework.getActive();
    setHomeworkData(items.slice(0, 3));
  };

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
    const entries = await journalEntries.getLastN(7);
    if (entries.length > 0) {
      const summary = calculateWeeklySummary(entries);
      setAnalytics(summary);
    }
  };

  const loadStats = async () => {
    const userStatsData = await userStats.get();
    setStats(userStatsData);
  };

  const handleSaveEntry = async () => {
    setShowCheckIn(false);
    await userStats.updateEntryStats();
    await loadAll();
  };

  const handleNewEntry = () => {
    setShowCheckIn(true);
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent tracking-tight">
            {t('journal.title')}
          </h1>
          {!showCheckIn && (
            <Button
              onClick={handleNewEntry}
              variant="primary"
              size="md"
            >
              <Plus size={20} />
              Создать запись
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
            className="bg-gradient-to-r from-green-500/20 to-teal-600/20 border border-green-500/30 rounded-2xl p-5"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{todayEntry.moodEmoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-300 mb-1">Запись на сегодня создана</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Настроение {todayEntry.mood}/10</span>
                  <span>•</span>
                  <span>Энергия {todayEntry.energy}%</span>
                  <span>•</span>
                  <span>Сон {todayEntry.sleepHours}ч</span>
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
            className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-12 text-center"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                <BookOpen size={40} className="text-blue-400" />
              </div>
              <div>
                <p className="text-gray-300 text-lg font-medium mb-2">
                  {t('journal.noEntries')}
                </p>
                <p className="text-gray-500 text-sm">
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

        {/* Calendar with History */}
        {!showCheckIn && hasEntries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-4">{t('journal.history')}</h2>
            <JournalCalendar onDateSelect={handleNewEntry} />
          </motion.div>
        )}

        {/* AI Insights */}
        {!showCheckIn && hasEntries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <AIInsights latestEntry={todayEntry} />
          </motion.div>
        )}

        {/* Analytics Preview (if has entries) */}
        {!showCheckIn && hasEntries && analytics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 size={20} className="text-green-400" />
                Аналитика (7 дней)
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-4 bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20">
                <Heart size={18} className="text-pink-400 mb-2" />
                <p className="text-2xl font-bold text-pink-300">{analytics.avgMood.toFixed(1)}</p>
                <p className="text-xs text-gray-400 mt-1">Настроение</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
                <Zap size={18} className="text-yellow-400 mb-2" />
                <p className="text-2xl font-bold text-yellow-300">{analytics.avgEnergy.toFixed(0)}%</p>
                <p className="text-xs text-gray-400 mt-1">Энергия</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                <Moon size={18} className="text-blue-400 mb-2" />
                <p className="text-2xl font-bold text-blue-300">{analytics.avgSleep.toFixed(1)}ч</p>
                <p className="text-xs text-gray-400 mt-1">Сон</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                <TrendingUp size={18} className="text-emerald-400 mb-2" />
                <p className="text-2xl font-bold text-emerald-300">{stats?.currentStreak || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Streak 🔥</p>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Study Widgets */}
        {!showCheckIn && hasEntries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <GraduationCap size={20} className="text-orange-400" />
              <h2 className="text-lg font-semibold">Учёба</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Schedule Widget */}
              <Card
                onClick={() => { haptic.light(); setShowSchedule(true); }}
                className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 hover:border-orange-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                    <Calendar size={20} className="text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">Расписание</h3>
                    <p className="text-xs text-gray-500">
                      {scheduleData.length > 0 ? `${scheduleData.length} урока` : 'Пусто'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {scheduleData.length > 0 ? (
                    scheduleData.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{item.startTime}</span>
                        <span className="text-gray-300">{item.subject}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-2">Нет уроков на сегодня</p>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <p className="text-xs text-orange-400 font-medium group-hover:text-orange-300">
                    {scheduleData.length > 0 ? 'Управление' : '+ Добавить урок'}
                  </p>
                </div>
              </Card>

              {/* Homework Widget */}
              <Card
                onClick={() => { haptic.light(); setShowHomework(true); }}
                className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <BookCheck size={20} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">Домашка</h3>
                    <p className="text-xs text-gray-500">
                      {homeworkData.length > 0 ? `${homeworkData.length} задания` : 'Пусто'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {homeworkData.length > 0 ? (
                    homeworkData.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded border border-gray-600 mt-0.5 flex-shrink-0"></div>
                        <p className="text-xs text-gray-300 line-clamp-1">
                          {item.subject}: {item.description || 'без описания'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-2">Нет активных заданий</p>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <p className="text-xs text-blue-400 font-medium group-hover:text-blue-300">
                    {homeworkData.length > 0 ? 'Управление' : '+ Добавить задание'}
                  </p>
                </div>
              </Card>

              {/* Calculator Widget */}
              <Card
                onClick={() => { haptic.light(); setShowGPA(true); }}
                className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Calculator size={20} className="text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">Калькуляторы</h3>
                    <p className="text-xs text-gray-500">GPA, средний балл</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Калькулятор оценок</p>
                    <p className="text-sm font-medium text-purple-300">Нажми для расчёта</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <p className="text-xs text-purple-400 font-medium group-hover:text-purple-300">Открыть калькулятор</p>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <ScheduleManager
        isOpen={showSchedule}
        onClose={() => { setShowSchedule(false); loadSchedule(); }}
      />
      <HomeworkManager
        isOpen={showHomework}
        onClose={() => { setShowHomework(false); loadHomework(); }}
      />
      <GPACalculator
        isOpen={showGPA}
        onClose={() => setShowGPA(false)}
      />
    </motion.div>
  );
};

export default Journal;
