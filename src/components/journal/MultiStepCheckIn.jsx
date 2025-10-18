import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import Button from '../ui/Button';
import MoodSelector from './MoodSelector';
import SleepTracker from './SleepTracker';
import TagsSelector from './TagsSelector';
import { journalEntries } from '../../db/database';
import { useStore } from '../../store/useStore';
import { haptic } from '../../utils/telegram';

const MultiStepCheckIn = ({ existingEntry, onSave, onCancel }) => {
  const { showToast } = useStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: existingEntry?.date || new Date().toISOString().split('T')[0],
    mood: existingEntry?.mood ? { value: existingEntry.mood, emoji: existingEntry.moodEmoji } : null,
    energy: existingEntry?.energy || 75,
    sleepHours: existingEntry?.sleepHours || 7,
    sleepQuality: existingEntry?.sleepQuality || 3,
    tags: existingEntry?.tags || [],
    note: existingEntry?.note || ''
  });

  const totalSteps = 4;

  const steps = [
    { id: 1, title: 'Как настроение?', icon: '😊' },
    { id: 2, title: 'Как спалось?', icon: '😴' },
    { id: 3, title: 'Чем занимался?', icon: '🎯' },
    { id: 4, title: 'Заметки', icon: '📝' }
  ];

  const handleNext = () => {
    if (step === 1 && !formData.mood) {
      showToast('Выбери настроение', 'warning');
      return;
    }

    haptic.light();
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSave();
    }
  };

  const handlePrev = () => {
    haptic.light();
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  const handleSave = async () => {
    try {
      const entry = {
        date: formData.date,
        mood: formData.mood.value,
        moodEmoji: formData.mood.emoji,
        energy: formData.energy,
        sleepHours: formData.sleepHours,
        sleepQuality: formData.sleepQuality,
        tags: formData.tags,
        note: formData.note
      };

      if (existingEntry) {
        await journalEntries.update(existingEntry.id, entry);
      } else {
        await journalEntries.create(entry);
      }

      haptic.success();
      showToast('Запись сохранена', 'success');
      onSave();
    } catch (error) {
      showToast('Ошибка сохранения', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-400">
            Шаг {step} из {totalSteps}
          </span>
          <span className="text-xs text-gray-500">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center gap-2">
        {steps.map((s) => (
          <motion.div
            key={s.id}
            className={`text-2xl transition-all ${
              s.id === step ? 'scale-125' : s.id < step ? 'opacity-50 scale-90' : 'opacity-30 scale-75'
            }`}
            animate={{ scale: s.id === step ? 1.25 : s.id < step ? 0.9 : 0.75 }}
          >
            {s.id < step ? '✅' : s.icon}
          </motion.div>
        ))}
      </div>

      {/* Content Card with Liquid Glass */}
      <motion.div
        className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-2xl backdrop-saturate-150 rounded-3xl p-6 border border-white/10 shadow-2xl min-h-[400px]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Step 1: Mood */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  {steps[0].title}
                </h2>
                <MoodSelector
                  value={formData.mood}
                  onChange={(mood) => setFormData({ ...formData, mood })}
                />
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Энергия: {formData.energy}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.energy}
                    onChange={(e) => setFormData({ ...formData, energy: parseInt(e.target.value) })}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Sleep */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  {steps[1].title}
                </h2>
                <SleepTracker
                  sleepHours={formData.sleepHours}
                  sleepQuality={formData.sleepQuality}
                  onChange={({ sleepHours, sleepQuality }) =>
                    setFormData({ ...formData, sleepHours, sleepQuality })
                  }
                />
              </div>
            )}

            {/* Step 3: Tags */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  {steps[2].title}
                </h2>
                <TagsSelector
                  selectedTags={formData.tags}
                  onChange={(tags) => setFormData({ ...formData, tags })}
                />
              </div>
            )}

            {/* Step 4: Note */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  {steps[3].title}
                </h2>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Напиши что-нибудь о сегодняшнем дне..."
                  className="w-full h-48 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-2xl text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handlePrev}
          variant="secondary"
          className="flex-1"
        >
          <ChevronLeft size={20} />
          {step === 1 ? 'Отмена' : 'Назад'}
        </Button>
        <Button
          onClick={handleNext}
          variant="primary"
          className="flex-1"
        >
          {step === totalSteps ? (
            <>
              <Check size={20} />
              Сохранить
            </>
          ) : (
            <>
              Далее
              <ChevronRight size={20} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MultiStepCheckIn;
