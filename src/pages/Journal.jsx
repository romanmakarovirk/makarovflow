import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, BookOpen } from 'lucide-react';
import Button from '../components/ui/Button';
import MultiStepCheckIn from '../components/journal/MultiStepCheckIn';
import JournalCalendar from '../components/journal/JournalCalendar';
import AIInsights from '../components/journal/AIInsights';
import { journalEntries } from '../db/database';

const Journal = () => {
  const { t } = useTranslation();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [hasEntries, setHasEntries] = useState(false);
  const [todayEntry, setTodayEntry] = useState(null);

  useEffect(() => {
    checkTodayEntry();
    checkHasEntries();
  }, []);

  const checkTodayEntry = async () => {
    const today = new Date().toISOString().split('T')[0];
    const entry = await journalEntries.getByDate(today);
    setTodayEntry(entry);
  };

  const checkHasEntries = async () => {
    const entries = await journalEntries.getAll();
    setHasEntries(entries.length > 0);
  };

  const handleSaveEntry = () => {
    setShowCheckIn(false);
    checkTodayEntry();
    checkHasEntries();
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
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            {t('journal.title')}
          </h1>
          {!showCheckIn && (
            <Button
              onClick={handleNewEntry}
              variant="primary"
              size="md"
            >
              <Plus size={20} />
              {todayEntry ? 'Редактировать' : 'Новая запись'}
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
            className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-5"
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
            className="bg-gray-800/30 border border-gray-700/30 rounded-3xl p-16 text-center"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-700/50 flex items-center justify-center">
                <BookOpen size={32} className="text-gray-400" />
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

        {/* Stats Preview (if has entries) */}
        {!showCheckIn && hasEntries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-5 text-center hover:bg-gray-800/60 transition-all"
            >
              <p className="text-2xl font-semibold text-white mb-1">
                {hasEntries ? '🎉' : '0'}
              </p>
              <p className="text-xs text-gray-500 font-medium">Записей</p>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={todayEntry ? handleNewEntry : undefined}
              className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-5 text-center hover:bg-gray-800/60 transition-all"
            >
              <p className="text-2xl font-semibold text-white mb-1">
                {todayEntry ? '✅' : '⏳'}
              </p>
              <p className="text-xs text-gray-500 font-medium">Сегодня</p>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-5 text-center hover:bg-gray-800/60 transition-all"
            >
              <p className="text-2xl font-semibold text-white mb-1">📈</p>
              <p className="text-xs text-gray-500 font-medium">Прогресс</p>
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Journal;
