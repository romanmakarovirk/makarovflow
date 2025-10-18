import { useTranslation } from 'react-i18next';
import { Moon, Star } from 'lucide-react';
import { haptic } from '../../utils/telegram';
import Input from '../ui/Input';

const SleepTracker = ({ sleepHours, sleepQuality, onChange }) => {
  const { t } = useTranslation();

  const handleHoursChange = (e) => {
    const hours = parseFloat(e.target.value) || 0;
    onChange({ sleepHours: hours, sleepQuality });
    haptic.light();
  };

  const handleQualityChange = (quality) => {
    onChange({ sleepHours, sleepQuality: quality });
    haptic.light();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">
        {t('journal.sleepLastNight')}
      </label>

      {/* Sleep hours input */}
      <div className="flex items-center gap-3">
        <Moon className="text-blue-400" size={24} />
        <Input
          type="number"
          value={sleepHours || ''}
          onChange={handleHoursChange}
          placeholder="0"
          min="0"
          max="24"
          step="0.5"
          className="flex-1"
        />
        <span className="text-gray-400 text-sm whitespace-nowrap">
          {t('journal.sleepHours')}
        </span>
      </div>

      {/* Sleep quality stars */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{t('journal.sleepQuality')}</span>
          <span className="text-sm text-blue-400 font-medium">
            {sleepQuality || 0}/5
          </span>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleQualityChange(star)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                size={32}
                className={`transition-colors ${
                  star <= (sleepQuality || 0)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-700'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Sleep quality indicators */}
      {sleepQuality > 0 && (
        <div className="mt-2 text-center">
          <span className={`text-sm font-medium ${
            sleepQuality >= 4 ? 'text-green-400' :
            sleepQuality >= 3 ? 'text-yellow-400' :
            'text-orange-400'
          }`}>
            {sleepQuality >= 4 ? '✨ Отличный сон!' :
             sleepQuality >= 3 ? '👍 Неплохо' :
             sleepQuality >= 2 ? '😴 Можно лучше' :
             '😞 Плохой сон'}
          </span>
        </div>
      )}
    </div>
  );
};

export default SleepTracker;
