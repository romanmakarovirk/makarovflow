import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, AlertCircle, CheckCircle, Plus, Trash2, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { homework } from '../../db/database';
import { haptic } from '../../utils/telegram';

const HomeworkTab = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const allTasks = await homework.getAll();
    setTasks(allTasks);
  };

  const handleToggleComplete = async (task) => {
    haptic.light();
    await homework.update(task.id, {
      completed: !task.completed,
      completedAt: !task.completed ? Date.now() : null
    });
    loadTasks();
  };

  const handleDeleteTask = async (id) => {
    if (confirm('Удалить домашнее задание?')) {
      await homework.delete(id);
      loadTasks();
      haptic.success();
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateColor = (dueDate, completed) => {
    if (completed) return 'text-gray-500';
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return 'text-red-400';
    if (days === 0) return 'text-orange-400';
    if (days === 1) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getDueDateText = (dueDate) => {
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return `Просрочено на ${Math.abs(days)} дн.`;
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Завтра';
    return `Через ${days} дн.`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
      default:
        return '';
    }
  };

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      if (filter === 'pending') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    })
    .sort((a, b) => {
      // Completed tasks go to bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Sort by due date (earliest first)
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-750'
            }`}
          >
            Все ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'pending'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-750'
            }`}
          >
            Активные ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'completed'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-750'
            }`}
          >
            Готовые ({completedCount})
          </button>
        </div>
      </div>

      {/* Tasks list */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-4 ${task.completed ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="flex-shrink-0 mt-1"
                    >
                      {task.completed ? (
                        <CheckCircle className="text-green-400" size={24} />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-600 hover:border-orange-500 transition-colors" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3
                          className={`font-bold text-lg ${
                            task.completed ? 'line-through text-gray-500' : ''
                          }`}
                        >
                          {task.subject}
                        </h3>

                        {/* Priority badge */}
                        {task.priority && (
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {getPriorityLabel(task.priority)}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p
                          className={`text-sm mb-3 ${
                            task.completed ? 'text-gray-600' : 'text-gray-300'
                          }`}
                        >
                          {task.description}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className={getDueDateColor(task.dueDate, task.completed)} />
                          <span className={`text-sm font-medium ${getDueDateColor(task.dueDate, task.completed)}`}>
                            {getDueDateText(task.dueDate)} ({new Date(task.dueDate).toLocaleDateString('ru-RU')})
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-400 mb-4">
            {filter === 'completed'
              ? 'Нет выполненных заданий'
              : filter === 'pending'
              ? 'Нет активных заданий'
              : 'Нет домашних заданий'}
          </p>
          <Button onClick={() => setShowAddModal(true)} variant="primary">
            <Plus size={20} />
            Добавить задание
          </Button>
        </Card>
      )}

      {/* Add button */}
      {filteredTasks.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={() => setShowAddModal(true)} variant="primary">
            <Plus size={20} />
            Добавить задание
          </Button>
        </div>
      )}

      {/* Add Homework Modal */}
      <AddHomeworkModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={loadTasks}
      />
    </div>
  );
};

// AddHomeworkModal Component
const AddHomeworkModal = ({ isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  });

  // Set default due date to tomorrow
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      setFormData((prev) => ({ ...prev, dueDate: dateStr }));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await homework.create({
      subject: formData.subject,
      description: formData.description,
      dueDate: formData.dueDate,
      priority: formData.priority,
      completed: false
    });

    setFormData({
      subject: '',
      description: '',
      dueDate: '',
      priority: 'medium'
    });

    onSave();
    onClose();
    haptic.success();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Добавить задание">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Предмет</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Математика"
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Описание</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Решить задачи 1-10 на стр. 45"
            rows="3"
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Срок сдачи</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Приоритет</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, priority: 'low' })}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                formData.priority === 'low'
                  ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-2 border-green-500'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
              }`}
            >
              Низкий
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, priority: 'medium' })}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                formData.priority === 'medium'
                  ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-2 border-yellow-500'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
              }`}
            >
              Средний
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, priority: 'high' })}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                formData.priority === 'high'
                  ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-2 border-red-500'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
              }`}
            >
              Высокий
            </button>
          </div>
        </div>

        <Button type="submit" variant="primary" fullWidth>
          Добавить задание
        </Button>
      </form>
    </Modal>
  );
};

export default HomeworkTab;
