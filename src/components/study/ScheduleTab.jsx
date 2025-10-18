import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, MapPin, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { schedule } from '../../db/database';
import { haptic } from '../../utils/telegram';

const ScheduleTab = () => {
  const { t } = useTranslation();
  const [lessons, setLessons] = useState([]);
  const [currentDay, setCurrentDay] = useState(new Date().getDay());
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);

  const days = [
    { id: 1, name: t('days.monday'), short: 'Пн' },
    { id: 2, name: t('days.tuesday'), short: 'Вт' },
    { id: 3, name: t('days.wednesday'), short: 'Ср' },
    { id: 4, name: t('days.thursday'), short: 'Чт' },
    { id: 5, name: t('days.friday'), short: 'Пт' },
    { id: 6, name: t('days.saturday'), short: 'Сб' },
    { id: 0, name: t('days.sunday'), short: 'Вс' }
  ];

  useEffect(() => {
    loadLessons();
  }, [currentDay]);

  const loadLessons = async () => {
    const dayLessons = await schedule.getByDay(currentDay);
    setLessons(dayLessons);
  };

  const handleDayChange = (dayId) => {
    haptic.light();
    setCurrentDay(dayId);
  };

  const handleAddLesson = () => {
    setShowAddModal(true);
  };

  const handleDeleteLesson = async (id) => {
    if (confirm('Удалить урок из расписания?')) {
      await schedule.delete(id);
      loadLessons();
      haptic.success();
    }
  };

  const getCurrentLesson = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    return lessons.find(lesson => {
      return lesson.startTime <= currentTime && lesson.endTime >= currentTime;
    });
  };

  const getNextLesson = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    return lessons.find(lesson => lesson.startTime > currentTime);
  };

  const current = getCurrentLesson();
  const next = getNextLesson();

  return (
    <div className="space-y-6">
      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => (
          <button
            key={day.id}
            onClick={() => handleDayChange(day.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
              currentDay === day.id
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
            }`}
          >
            {day.short}
          </button>
        ))}
      </div>

      {/* Current/Next lesson indicator */}
      {currentDay === new Date().getDay() && (current || next) && (
        <Card className="p-4 bg-gradient-to-r from-orange-500/10 to-red-600/10 border border-orange-500/30">
          <div className="space-y-3">
            {current && (
              <div>
                <p className="text-xs text-gray-400 mb-1">🔴 {t('study.currentLesson')}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">{current.subject}</p>
                    <p className="text-sm text-gray-400">
                      {current.startTime} - {current.endTime}
                    </p>
                  </div>
                  {current.room && (
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <MapPin size={14} />
                      {current.room}
                    </div>
                  )}
                </div>
              </div>
            )}

            {next && (
              <div className="pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-400 mb-1">{t('study.nextLesson')}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{next.subject}</p>
                    <p className="text-sm text-gray-400">
                      {next.startTime} - {next.endTime}
                    </p>
                  </div>
                  {next.room && (
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <MapPin size={14} />
                      {next.room}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Lessons list */}
      {lessons.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="p-4"
                  style={{ borderLeft: `4px solid ${lesson.color || '#3B82F6'}` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{lesson.subject}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {lesson.startTime} - {lesson.endTime}
                        </div>
                        {lesson.room && (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            {lesson.room}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-400 mb-4">{t('study.noSchedule')}</p>
          <Button onClick={handleAddLesson} variant="primary">
            <Plus size={20} />
            {t('study.addLesson')}
          </Button>
        </Card>
      )}

      {/* Add button */}
      {lessons.length > 0 && (
        <Button onClick={handleAddLesson} variant="primary" fullWidth>
          <Plus size={20} />
          {t('study.addLesson')}
        </Button>
      )}

      {/* Add Lesson Modal */}
      <AddLessonModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        dayOfWeek={currentDay}
        onSave={loadLessons}
      />
    </div>
  );
};

// AddLessonModal Component
const AddLessonModal = ({ isOpen, onClose, dayOfWeek, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    subject: '',
    startTime: '09:00',
    endTime: '10:30',
    room: '',
    color: '#3B82F6'
  });

  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // orange
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316'  // orange-red
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    await schedule.create({
      subject: formData.subject,
      dayOfWeek,
      startTime: formData.startTime,
      endTime: formData.endTime,
      room: formData.room,
      color: formData.color,
      recurring: true
    });

    setFormData({
      subject: '',
      startTime: '09:00',
      endTime: '10:30',
      room: '',
      color: '#3B82F6'
    });

    onSave();
    onClose();
    haptic.success();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('study.addLesson')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('study.subject')}
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Начало
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Конец
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('study.room')}
          </label>
          <input
            type="text"
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            placeholder="Ауд. 205"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Цвет
          </label>
          <div className="flex gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-10 h-10 rounded-lg transition-transform ${
                  formData.color === color ? 'scale-110 ring-2 ring-white' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <Button type="submit" variant="primary" fullWidth>
          Добавить урок
        </Button>
      </form>
    </Modal>
  );
};

export default ScheduleTab;
