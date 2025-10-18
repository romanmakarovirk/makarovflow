import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { haptic } from '../../utils/telegram';

const MoodSelector = ({ value, onChange }) => {
  const { t } = useTranslation();

  const moods = [
    { emoji: '😢', value: 2, label: t('mood.veryBad'), color: 'from-red-500 to-orange-600' },
    { emoji: '😟', value: 4, label: t('mood.bad'), color: 'from-orange-500 to-yellow-600' },
    { emoji: '😐', value: 6, label: t('mood.neutral'), color: 'from-yellow-500 to-green-500' },
    { emoji: '🙂', value: 8, label: t('mood.good'), color: 'from-green-500 to-teal-500' },
    { emoji: '😊', value: 10, label: t('mood.veryGood'), color: 'from-teal-500 to-blue-500' }
  ];

  const handleMoodClick = (moodValue, emoji) => {
    haptic.light();
    onChange({ value: moodValue, emoji });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        {t('journal.howAreYou')}
      </label>
      <div className="flex items-center justify-between gap-2">
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
                transition-all duration-300 relative overflow-hidden
                ${isSelected
                  ? `bg-gradient-to-br ${mood.color} shadow-lg scale-110`
                  : 'bg-gray-800 hover:bg-gray-750'
                }
              `}
            >
              {isSelected && (
                <motion.div
                  layoutId="selectedMood"
                  className="absolute inset-0 bg-white/10"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <span className={`text-3xl relative z-10 ${isSelected ? 'scale-110' : ''}`}>
                {mood.emoji}
              </span>
              <span className={`text-xs mt-1 font-medium relative z-10 ${
                isSelected ? 'text-white' : 'text-gray-400'
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
