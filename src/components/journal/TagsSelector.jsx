import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Tag from '../ui/Tag';
import { motion, AnimatePresence } from 'framer-motion';

const TagsSelector = ({ selectedTags, onChange }) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const availableTags = [
    { id: 'walked_outside', label: t('journal.tags.walked_outside'), icon: '🌳' },
    { id: 'lot_of_homework', label: t('journal.tags.lot_of_homework'), icon: '📚' },
    { id: 'met_friends', label: t('journal.tags.met_friends'), icon: '👥' },
    { id: 'exercised', label: t('journal.tags.exercised'), icon: '💪' },
    { id: 'felt_stressed', label: t('journal.tags.felt_stressed'), icon: '😰' },
    { id: 'ate_well', label: t('journal.tags.ate_well'), icon: '🍎' },
    { id: 'productive_day', label: t('journal.tags.productive_day'), icon: '✅' },
    { id: 'lazy_day', label: t('journal.tags.lazy_day'), icon: '😴' },
    { id: 'studied', label: t('journal.tags.studied'), icon: '📖' },
    { id: 'watched_movies', label: t('journal.tags.watched_movies'), icon: '🎬' },
    { id: 'played_games', label: t('journal.tags.played_games'), icon: '🎮' },
    { id: 'family_time', label: t('journal.tags.family_time'), icon: '👨‍👩‍👧‍👦' }
  ];

  const visibleTags = showAll ? availableTags : availableTags.slice(0, 6);

  const handleTagClick = (tagId) => {
    const isSelected = selectedTags.includes(tagId);
    if (isSelected) {
      onChange(selectedTags.filter(id => id !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        {t('journal.whatHappened')}
      </label>

      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tag) => (
          <Tag
            key={tag.id}
            selected={selectedTags.includes(tag.id)}
            onClick={() => handleTagClick(tag.id)}
          >
            <span>{tag.icon}</span>
            <span>{tag.label}</span>
          </Tag>
        ))}
      </div>

      {/* Show more/less button */}
      <button
        type="button"
        onClick={() => setShowAll(!showAll)}
        className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
      >
        {showAll ? (
          <>
            <ChevronUp size={16} />
            Скрыть
          </>
        ) : (
          <>
            <ChevronDown size={16} />
            Показать все ({availableTags.length - 6} ещё)
          </>
        )}
      </button>

      {/* Selected count */}
      {selectedTags.length > 0 && (
        <div className="text-xs text-gray-400">
          Выбрано: {selectedTags.length}
        </div>
      )}
    </div>
  );
};

export default TagsSelector;
