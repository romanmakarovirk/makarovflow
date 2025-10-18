import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { haptic } from '../../utils/telegram';

const MoodSelector = ({ value, onChange }) => {
  const { t } = useTranslation();

  const moods = [
    { emoji: '😢', value: 2, label: t('mood.veryBad'), color: 'bg-rose-500/20 border-rose-500/40' },
    { emoji: '😟', value: 4, label: t('mood.bad'), color: 'bg-amber-500/20 border-amber-500/40' },
    { emoji: '😐', value: 6, label: t('mood.neutral'), color: 'bg-slate-500/20 border-slate-500/40' },
    { emoji: '🙂', value: 8, label: t('mood.good'), color: 'bg-emerald-500/20 border-emerald-500/40' },
    { emoji: '😊', value: 10, label: t('mood.veryGood'), color: 'bg-cyan-500/20 border-cyan-500/40' }
  ];

  const handleMoodClick = (moodValue, emoji) => {
    haptic.light();
    onChange({ value: moodValue, emoji });
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-400">
        {t('journal.howAreYou')}
      </label>
      <div className="flex items-center justify-between gap-3">
        {moods.map((mood) => {
          const isSelected = value?.value === mood.value;

          return (
            <motion.button
              key={mood.value}
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => handleMoodClick(mood.value, mood.emoji)}
              className={`
                flex-1 aspect-square rounded-2xl flex flex-col items-center justify-center
                transition-all duration-200 border
                ${isSelected
                  ? mood.color
                  : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60'
                }
              `}
            >
              <span className={`text-3xl transition-transform ${isSelected ? 'scale-110' : ''}`}>
                {mood.emoji}
              </span>
              <span className={`text-xs mt-2 font-medium ${
                isSelected ? 'text-white' : 'text-gray-500'
              }`}>
                {mood.label.split(' ')[0]}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodSelector;
