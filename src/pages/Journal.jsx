import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, BookOpen } from 'lucide-react';
import Button from '../components/ui/Button';
import MultiStepCheckIn from '../components/journal/MultiStepCheckIn';
import JournalCalendar from '../components/journal/JournalCalendar';
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
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
            className="bg-gradient-to-r from-green-500/20 to-teal-600/20 border border-green-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{todayEntry.moodEmoji}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-300">Запись на сегодня создана</p>
                <p className="text-xs text-gray-400">
                  Настроение: {todayEntry.mood}/10 • Энергия: {todayEntry.energy}% • Сон: {todayEntry.sleepHours}ч
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!showCheckIn && !hasEntries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                <BookOpen size={40} className="text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-lg font-medium mb-2">
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
              className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl backdrop-saturate-150 rounded-2xl p-4 text-center border border-white/5 shadow-lg hover:shadow-blue-500/20 transition-all active:shadow-blue-500/40"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl" />
              <p className="relative text-2xl font-bold text-blue-400 mb-1">
                {hasEntries ? '🎉' : '0'}
              </p>
              <p className="relative text-xs text-gray-400 font-medium">Записей</p>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={todayEntry ? handleNewEntry : undefined}
              className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl backdrop-saturate-150 rounded-2xl p-4 text-center border border-white/5 shadow-lg hover:shadow-green-500/20 transition-all active:shadow-green-500/40"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl" />
              <p className="relative text-2xl font-bold text-green-400 mb-1">
                {todayEntry ? '✅' : '⏳'}
              </p>
              <p className="relative text-xs text-gray-400 font-medium">Сегодня</p>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl backdrop-saturate-150 rounded-2xl p-4 text-center border border-white/5 shadow-lg hover:shadow-purple-500/20 transition-all active:shadow-purple-500/40"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl" />
              <p className="relative text-2xl font-bold text-purple-400 mb-1">📈</p>
              <p className="relative text-xs text-gray-400 font-medium">Прогресс</p>
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Journal;
