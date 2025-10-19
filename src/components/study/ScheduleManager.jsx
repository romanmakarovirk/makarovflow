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
  const [formData, setFormData] = useState({
    subject: '',
    dayOfWeek: new Date().getDay() || 1,
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
      dayOfWeek: new Date().getDay() || 1,
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
    const today = new Date().getDay();
    return scheduleItems.filter(item => item.dayOfWeek === today);
  };

  const todayItems = getTodaySchedule();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Расписание">
      <div className="space-y-4">
        {/* Today's schedule */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Сегодня ({DAYS[new Date().getDay() - 1] || 'Вс'})</h3>
          {todayItems.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Сегодня нет уроков</p>
          ) : (
            <div className="space-y-2">
              {todayItems.map((item) => (
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
          )}
        </div>

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
