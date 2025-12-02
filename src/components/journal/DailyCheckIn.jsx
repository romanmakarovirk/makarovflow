import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Calendar } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Slider from '../ui/Slider';
import MoodSelector from './MoodSelector';
import SleepTracker from './SleepTracker';
import TagsSelector from './TagsSelector';
import { journalEntries } from '../../db/database';
import { useStore } from '../../store/useStore';
import { getLocalDate } from '../../utils/dates';

const DailyCheckIn = ({ onSave, onCancel, existingEntry }) => {
  const { t } = useTranslation();
  const { showToast } = useStore();

  const today = getLocalDate();

  const [formData, setFormData] = useState({
    date: today,
    mood: null,
    energy: 50,
    sleepHours: 7,
    sleepQuality: 3,
    tags: [],
    note: ''
  });

  // Load existing entry if editing
  useEffect(() => {
    if (existingEntry) {
      setFormData({
        date: existingEntry.date,
        mood: { value: existingEntry.mood, emoji: existingEntry.moodEmoji },
        energy: existingEntry.energy,
        sleepHours: existingEntry.sleepHours,
        sleepQuality: existingEntry.sleepQuality,
        tags: existingEntry.tags || [],
        note: existingEntry.note || ''
      });
    }
  }, [existingEntry]);

  const handleMoodChange = (mood) => {
    setFormData(prev => ({ ...prev, mood }));
  };

  const handleEnergyChange = (energy) => {
    setFormData(prev => ({ ...prev, energy }));
  };

  const handleSleepChange = ({ sleepHours, sleepQuality }) => {
    setFormData(prev => ({
      ...prev,
      sleepHours: sleepHours !== undefined ? sleepHours : prev.sleepHours,
      sleepQuality: sleepQuality !== undefined ? sleepQuality : prev.sleepQuality
    }));
  };

  const handleTagsChange = (tags) => {
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleNoteChange = (e) => {
    setFormData(prev => ({ ...prev, note: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.mood) {
      showToast('Выбери настроение', 'warning');
      return;
    }

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
        // Update existing entry
        await journalEntries.update(existingEntry.id, entry);
        showToast(t('common.success'), 'success');
      } else {
        // Check if entry for today already exists
        const exists = await journalEntries.existsForDate(formData.date);
        if (exists) {
          showToast('Запись на сегодня уже существует', 'warning');
          return;
        }

        // Create new entry
        await journalEntries.create(entry);
        showToast(t('common.success'), 'success');
      }

      // Reset form
      setFormData({
        date: today,
        mood: null,
        energy: 50,
        sleepHours: 7,
        sleepQuality: 3,
        tags: [],
        note: ''
      });

      onSave?.();
    } catch (error) {
      console.error('Failed to save entry:', error);
      showToast(t('common.error'), 'error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-700">
          <Calendar className="text-blue-400" size={24} />
          <div>
            <h2 className="text-xl font-bold">{t('journal.dailyCheckIn')}</h2>
            <p className="text-sm text-gray-400">{formatDate(formData.date)}</p>
          </div>
        </div>

        {/* Mood Selector */}
        <MoodSelector value={formData.mood} onChange={handleMoodChange} />

        {/* Energy Slider */}
        <Slider
          label={t('journal.energyLevel')}
          value={formData.energy}
          onChange={handleEnergyChange}
          min={0}
          max={100}
        />

        {/* Sleep Tracker */}
        <SleepTracker
          sleepHours={formData.sleepHours}
          sleepQuality={formData.sleepQuality}
          onChange={handleSleepChange}
        />

        {/* Tags Selector */}
        <TagsSelector
          selectedTags={formData.tags}
          onChange={handleTagsChange}
        />

        {/* Note */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            {t('journal.tellAboutDay')}
          </label>
          <textarea
            value={formData.note}
            onChange={handleNoteChange}
            placeholder="Опиши свой день, мысли, чувства..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
              text-white placeholder-gray-500 resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200"
          />
          <p className="text-xs text-gray-500">
            {formData.note.length} символов
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
          >
            <Save size={20} />
            {existingEntry ? t('journal.updateEntry') : t('journal.saveEntry')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DailyCheckIn;
