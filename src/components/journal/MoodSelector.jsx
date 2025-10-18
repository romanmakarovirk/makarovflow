import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { haptic } from '../../utils/telegram';

const MoodSelector = ({ value, onChange }) => {
  const { t } = useTranslation();

  const moods = [
    {
      emoji: '😢',
      value: 2,
      label: t('mood.veryBad'),
      bgLight: 'bg-red-100',
      bgDark: 'bg-red-500/20',
      borderLight: 'border-red-300',
      borderDark: 'border-red-500/40',
      textLight: 'text-red-700',
      textDark: 'text-red-300',
      shadowLight: 'shadow-red-200/50',
      shadowDark: 'shadow-red-500/20'
    },
    {
      emoji: '😟',
      value: 4,
      label: t('mood.bad'),
      bgLight: 'bg-orange-100',
      bgDark: 'bg-orange-500/20',
      borderLight: 'border-orange-300',
      borderDark: 'border-orange-500/40',
      textLight: 'text-orange-700',
      textDark: 'text-orange-300',
      shadowLight: 'shadow-orange-200/50',
      shadowDark: 'shadow-orange-500/20'
    },
    {
      emoji: '😐',
      value: 6,
      label: t('mood.neutral'),
      bgLight: 'bg-gray-100',
      bgDark: 'bg-gray-500/20',
      borderLight: 'border-gray-300',
      borderDark: 'border-gray-500/40',
      textLight: 'text-gray-700',
      textDark: 'text-gray-300',
      shadowLight: 'shadow-gray-200/50',
      shadowDark: 'shadow-gray-500/20'
    },
    {
      emoji: '🙂',
      value: 8,
      label: t('mood.good'),
      bgLight: 'bg-green-100',
      bgDark: 'bg-emerald-500/20',
      borderLight: 'border-green-300',
      borderDark: 'border-emerald-500/40',
      textLight: 'text-green-700',
      textDark: 'text-emerald-300',
      shadowLight: 'shadow-green-200/50',
      shadowDark: 'shadow-emerald-500/20'
    },
    {
      emoji: '😊',
      value: 10,
      label: t('mood.veryGood'),
      bgLight: 'bg-blue-100',
      bgDark: 'bg-cyan-500/20',
      borderLight: 'border-blue-300',
      borderDark: 'border-cyan-500/40',
      textLight: 'text-blue-700',
      textDark: 'text-cyan-300',
      shadowLight: 'shadow-blue-200/50',
      shadowDark: 'shadow-cyan-500/20'
    }
  ];

  const handleMoodClick = (moodValue, emoji) => {
    haptic.light();
    onChange({ value: moodValue, emoji });
  };

  return (
    <div className="space-y-5">
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
        {t('journal.howAreYou')}
      </label>
      <div className="grid grid-cols-5 gap-3">
        {moods.map((mood) => {
          const isSelected = value?.value === mood.value;

          return (
            <motion.button
              key={mood.value}
              type="button"
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleMoodClick(mood.value, mood.emoji)}
              className={`
                relative flex flex-col items-center justify-center p-4 rounded-3xl
                transition-all duration-300 border-2
                ${isSelected
                  ? `${mood.bgLight} dark:${mood.bgDark} ${mood.borderLight} dark:${mood.borderDark} shadow-lg ${mood.shadowLight} dark:${mood.shadowDark}`
                  : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              {/* Emoji */}
              <motion.span
                className="text-4xl mb-2 select-none"
                animate={{
                  scale: isSelected ? 1.15 : 1,
                  rotate: isSelected ? [0, -10, 10, -10, 0] : 0
                }}
                transition={{
                  scale: { type: "spring", stiffness: 300, damping: 20 },
                  rotate: { duration: 0.5 }
                }}
              >
                {mood.emoji}
              </motion.span>

              {/* Label */}
              <span className={`
                text-[10px] font-semibold text-center leading-tight transition-all duration-300 max-w-full truncate px-1
                ${isSelected
                  ? `${mood.textLight} dark:${mood.textDark}`
                  : 'text-gray-500 dark:text-gray-500'
                }
              `}>
                {mood.label.split(' ')[0]}
              </span>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  layoutId="moodSelection"
                  className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${mood.bgLight} dark:${mood.bgDark} ${mood.borderLight} dark:${mood.borderDark} border-2 flex items-center justify-center`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <svg className={`w-3 h-3 ${mood.textLight} dark:${mood.textDark}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodSelector;
