import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookCheck, Plus, X } from 'lucide-react';
import { homework } from '../../db/database';
import { useStore } from '../../store/useStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { haptic } from '../../utils/telegram';
import { getLocalDate } from '../../utils/dates';

const HomeworkManager = ({ isOpen, onClose }) => {
  const { showToast } = useStore();
  const [homeworkItems, setHomeworkItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    dueDate: getLocalDate(),
    priority: 'medium'
  });

  useEffect(() => {
    if (isOpen) {
      loadHomework();
    }
  }, [isOpen]);

  const loadHomework = async () => {
    const items = await homework.getActive();
    setHomeworkItems(items);
  };

  const handleAdd = async () => {
    if (!formData.subject.trim()) {
      showToast('Введите предмет', 'warning');
      return;
    }

    await homework.create(formData);
    await loadHomework();
    setShowAddForm(false);
    setFormData({
      subject: '',
      description: '',
      dueDate: getLocalDate(),
      priority: 'medium'
    });
    haptic.success();
    showToast('Задание добавлено', 'success');
  };

  const handleToggle = async (id) => {
    await homework.toggleComplete(id);
    await loadHomework();
    haptic.light();
  };

  const handleDelete = async (id) => {
    await homework.delete(id);
    await loadHomework();
    haptic.light();
    showToast('Задание удалено', 'success');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Домашние задания">
      <div className="space-y-4">
        {/* Homework list */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Активные ({homeworkItems.length})
          </h3>
          {homeworkItems.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Нет активных заданий</p>
          ) : (
            <div className="space-y-2">
              {homeworkItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-colors"
                >
                  <button
                    onClick={() => handleToggle(item.id)}
                    className="w-5 h-5 mt-0.5 rounded border-2 border-gray-600 flex-shrink-0 hover:border-blue-500 transition-colors"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{item.subject}</p>
                    {item.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                    )}
                    <p className={`text-xs mt-1 ${getPriorityColor(item.priority)}`}>
                      Срок: {new Date(item.dueDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors flex-shrink-0"
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
                placeholder="Предмет"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />

              <textarea
                placeholder="Описание задания"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
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
              Добавить задание
            </Button>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default HomeworkManager;
