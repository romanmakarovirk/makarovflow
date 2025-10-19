import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, X, Clock } from 'lucide-react';
import { schedule } from '../../db/database';
import { useStore } from '../../store/useStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { haptic } from '../../utils/telegram';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

const ScheduleManager = ({ isOpen, onClose }) => {
  const { showToast } = useStore();
  const [scheduleItems, setScheduleItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const getDefaultDay = () => {
    let day = new Date().getDay();
    return day === 0 ? 7 : day; // Воскресенье = 7, остальные без изменений
  };

  const [formData, setFormData] = useState({
    subject: '',
    dayOfWeek: getDefaultDay(),
    startTime: '09:00',
    endTime: '10:30',
    room: '',
    color: COLORS[0],
    recurring: true
  });

  useEffect(() => {
    if (isOpen) {
      loadSchedule();
    }
  }, [isOpen]);

  const loadSchedule = async () => {
    const items = await schedule.getAll();
    setScheduleItems(items);
  };

  const handleAdd = async () => {
    if (!formData.subject.trim()) {
      showToast('Введите название предмета', 'warning');
      return;
    }

    await schedule.create(formData);
    await loadSchedule();
    setShowAddForm(false);
    setFormData({
      subject: '',
      dayOfWeek: getDefaultDay(),
      startTime: '09:00',
      endTime: '10:30',
      room: '',
      color: COLORS[0],
      recurring: true
    });
    haptic.success();
    showToast('Урок добавлен', 'success');
  };

  const handleDelete = async (id) => {
    await schedule.delete(id);
    await loadSchedule();
    haptic.light();
    showToast('Урок удалён', 'success');
  };

  const getTodaySchedule = () => {
    let today = new Date().getDay();
    // Воскресенье = 0, но в нашей системе 1-7 (Пн-Вс)
    if (today === 0) today = 7;
    return scheduleItems.filter(item => item.dayOfWeek === today);
  };

  const todayItems = getTodaySchedule();

  // Group all items by day
  const groupedByDay = {};
  scheduleItems.forEach(item => {
    if (!groupedByDay[item.dayOfWeek]) {
      groupedByDay[item.dayOfWeek] = [];
    }
    groupedByDay[item.dayOfWeek].push(item);
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Расписание">
      <div className="space-y-4">
        {/* All schedule items grouped by day */}
        {scheduleItems.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Расписание пусто</p>
            <p className="text-xs text-gray-600 mt-1">Добавьте первый урок</p>
          </div>
        ) : (
          <div className="space-y-4">
            {DAYS.map((dayName, idx) => {
              const dayNumber = idx + 1;
              const dayItems = groupedByDay[dayNumber] || [];
              const isToday = dayNumber === (new Date().getDay() === 0 ? 7 : new Date().getDay());

              if (dayItems.length === 0) return null;

              return (
                <div key={dayNumber}>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                    {dayName}
                    {isToday && <span className="text-xs text-blue-400">• Сегодня</span>}
                  </h3>
                  <div className="space-y-2">
                    {dayItems
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl"
                        >
                          <div className="w-1 h-12 rounded-full" style={{ backgroundColor: item.color }} />
                          <div className="flex-1">
                            <p className="font-medium text-white">{item.subject}</p>
                            <p className="text-xs text-gray-400">
                              {item.startTime} - {item.endTime}
                              {item.room && ` • ${item.room}`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                          >
                            <X size={16} className="text-gray-400" />
                          </button>
                        </motion.div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add new */}
        <AnimatePresence>
          {showAddForm ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 p-4 bg-gray-800/30 rounded-xl"
            >
              <input
                type="text"
                placeholder="Название предмета"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />

              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                {DAYS.map((day, idx) => (
                  <option key={idx} value={idx + 1}>{day}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <input
                type="text"
                placeholder="Аудитория (необязательно)"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />

              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      formData.color === color ? 'scale-125 ring-2 ring-white' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="primary" onClick={handleAdd} className="flex-1">
                  Добавить
                </Button>
                <Button variant="secondary" onClick={() => setShowAddForm(false)} className="flex-1">
                  Отмена
                </Button>
              </div>
            </motion.div>
          ) : (
            <Button
              variant="ghost"
              onClick={() => setShowAddForm(true)}
              className="w-full"
            >
              <Plus size={20} />
              Добавить урок
            </Button>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default ScheduleManager;
