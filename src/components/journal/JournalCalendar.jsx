import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import { journalEntries } from '../../db/database';
import { haptic } from '../../utils/telegram';

const JournalCalendar = ({ onDateSelect }) => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [currentDate]);

  const loadEntries = async () => {
    const allEntries = await journalEntries.getAll();
    setEntries(allEntries);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getEntryForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return entries.find(entry => entry.date === dateString);
  };

  const getMoodColor = (mood) => {
    if (mood >= 9) return 'bg-cyan-500';
    if (mood >= 7) return 'bg-emerald-500';
    if (mood >= 5) return 'bg-slate-400';
    if (mood >= 3) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const handlePrevMonth = () => {
    haptic.light();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    haptic.light();
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    const today = new Date();
    if (nextMonth <= today) {
      setCurrentDate(nextMonth);
    }
  };

  const handleDayClick = (date, entry) => {
    haptic.medium();
    if (entry) {
      setSelectedEntry(entry);
      setShowModal(true);
    } else {
      onDateSelect?.(date);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  // Generate calendar days
  const calendarDays = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Empty cells before first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push({ isEmpty: true, key: `empty-${i}` });
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    const entry = getEntryForDate(date);
    const isToday = date.getTime() === today.getTime();
    const isFuture = date > today;

    calendarDays.push({
      day,
      date,
      entry,
      isToday,
      isFuture,
      key: `day-${day}`
    });
  }

  return (
    <>
      <Card className="p-6 bg-gray-800/40 border-gray-700/50">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-400" />
            </button>

            <h3 className="text-base font-medium capitalize text-gray-300">{monthName}</h3>

            <button
              onClick={handleNextMonth}
              disabled={new Date(currentDate.getFullYear(), currentDate.getMonth() + 1) > today}
              className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Week days */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ isEmpty, day, date, entry, isToday, isFuture, key }) => {
              if (isEmpty) {
                return <div key={key} className="aspect-square" />;
              }

              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: isFuture ? 1 : 0.95 }}
                  onClick={() => !isFuture && handleDayClick(date, entry)}
                  disabled={isFuture}
                  className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center
                    relative transition-all duration-200
                    ${isFuture
                      ? 'text-gray-700 cursor-not-allowed'
                      : 'hover:bg-gray-700/40 cursor-pointer'
                    }
                    ${isToday ? 'ring-1 ring-gray-500' : ''}
                  `}
                >
                  <span className={`text-sm font-medium ${
                    entry ? 'text-white' : 'text-gray-500'
                  }`}>
                    {day}
                  </span>

                  {entry && (
                    <div className="flex items-center gap-1 mt-1.5">
                      {/* Mood indicator */}
                      <div className={`w-1.5 h-1.5 rounded-full ${getMoodColor(entry.mood)}`} />
                      {/* Sleep indicator */}
                      {entry.sleepQuality && (
                        <div className={`w-1 h-1 rounded-full ${
                          entry.sleepQuality >= 4 ? 'bg-cyan-400' : 'bg-gray-600'
                        }`} />
                      )}
                    </div>
                  )}

                  {!entry && !isFuture && (
                    <div className="w-1 h-1 rounded-full bg-gray-700/50 mt-1.5" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-700/50">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Плохо</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Норм</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Хорошо</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Entry Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedEntry && new Date(selectedEntry.date).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}
      >
        {selectedEntry && (
          <div className="space-y-4">
            {/* Mood */}
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selectedEntry.moodEmoji}</span>
              <div>
                <p className="text-sm text-gray-400">Настроение</p>
                <p className="text-lg font-semibold">{selectedEntry.mood}/10</p>
              </div>
            </div>

            {/* Energy */}
            <div>
              <p className="text-sm text-gray-400 mb-2">Энергия</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-400"
                    style={{ width: `${selectedEntry.energy}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-300">{selectedEntry.energy}%</span>
              </div>
            </div>

            {/* Sleep */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Сон</p>
                <p className="text-lg font-semibold">{selectedEntry.sleepHours}ч</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Качество</p>
                <p className="text-lg font-semibold">{selectedEntry.sleepQuality}/5</p>
              </div>
            </div>

            {/* Tags */}
            {selectedEntry.tags && selectedEntry.tags.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Активности</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-700 rounded-lg text-sm"
                    >
                      {t(`journal.tags.${tag}`)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Note */}
            {selectedEntry.note && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Заметка</p>
                <p className="text-gray-300 leading-relaxed">{selectedEntry.note}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default JournalCalendar;
