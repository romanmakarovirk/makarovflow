import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Bell, Trash2, Circle, CheckCircle2, ChevronDown } from 'lucide-react';
import { tasks, userStats } from '../db/database';
import { haptic } from '../utils/telegram';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const Tasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    notes: '',
    when: null,
    reminder: null
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const all = await tasks.getAll();
    setAllTasks(all);
  };

  const getFilteredTasks = () => {
    const today = new Date().toISOString().split('T')[0];

    switch (filter) {
      case 'today':
        return allTasks.filter(t => !t.completed && (t.when === 'today' || t.when === today));
      case 'upcoming':
        return allTasks.filter(t => !t.completed && t.when && t.when !== 'today' && t.when > today);
      case 'completed':
        return allTasks.filter(t => t.completed);
      default:
        return allTasks.filter(t => !t.completed);
    }
  };

  const handleToggleComplete = async (id) => {
    haptic.success();
    await tasks.toggleComplete(id);
    await userStats.updateTaskStats();
    loadTasks();
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;

    haptic.success();
    await tasks.create({
      ...newTask,
      list: newTask.when === 'today' ? 'today' : newTask.when ? 'upcoming' : 'inbox'
    });

    setNewTask({ title: '', notes: '', when: null, reminder: null });
    setShowAddModal(false);
    await userStats.updateTaskStats();
    loadTasks();
  };

  const handleDeleteTask = async (id) => {
    haptic.light();
    await tasks.delete(id);
    await userStats.updateTaskStats();
    loadTasks();
  };

  const handleSetDate = (date) => {
    setNewTask({ ...newTask, when: date });
  };

  const filteredTasks = getFilteredTasks();
  const todayCount = allTasks.filter(t => !t.completed && (t.when === 'today' || t.when === new Date().toISOString().split('T')[0])).length;
  const upcomingCount = allTasks.filter(t => !t.completed && t.when && t.when !== 'today' && t.when > new Date().toISOString().split('T')[0]).length;
  const completedCount = allTasks.filter(t => t.completed).length;

  const filters = [
    { id: 'all', label: 'Все', count: allTasks.filter(t => !t.completed).length, emoji: '📋' },
    { id: 'today', label: 'Сегодня', count: todayCount, emoji: '⭐' },
    { id: 'upcoming', label: 'Скоро', count: upcomingCount, emoji: '📅' },
    { id: 'completed', label: 'Готово', count: completedCount, emoji: '✅' }
  ];

  const getTaskDate = (task) => {
    if (!task.when) return null;
    if (task.when === 'today') return 'Сегодня';

    const date = new Date(task.when);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
      return 'Сегодня';
    }
    if (date.toISOString().split('T')[0] === tomorrow.toISOString().split('T')[0]) {
      return 'Завтра';
    }

    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const isOverdue = (task) => {
    if (!task.when || task.when === 'today' || task.completed) return false;
    return new Date(task.when) < new Date(new Date().toISOString().split('T')[0]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen p-4 pb-24"
    >
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Задачи
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {allTasks.filter(t => !t.completed).length} активных
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
          >
            <Plus size={24} className="text-white" />
          </motion.button>
        </div>

        {/* Filters - Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {filters.map((f) => (
            <motion.button
              key={f.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                haptic.light();
                setFilter(f.id);
              }}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all
                ${filter === f.id
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }
              `}
            >
              <span className="text-base">{f.emoji}</span>
              <span>{f.label}</span>
              {f.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  filter === f.id ? 'bg-gray-900/10' : 'bg-gray-700'
                }`}>
                  {f.count}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => {
              const taskDate = getTaskDate(task);
              const overdue = isOverdue(task);

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    height: 0,
                    marginBottom: 0,
                    transition: { duration: 0.2 }
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                >
                  <div className={`
                    relative bg-gray-800/40 backdrop-blur-sm rounded-2xl p-4
                    hover:bg-gray-800/60 transition-all group
                    ${task.completed ? 'opacity-50' : ''}
                    ${overdue ? 'border-l-4 border-red-500' : 'border-l-4 border-transparent'}
                  `}>
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <motion.button
                        onClick={() => handleToggleComplete(task.id)}
                        className="flex-shrink-0 mt-0.5"
                        whileTap={{ scale: 0.9 }}
                      >
                        <AnimatePresence mode="wait">
                          {task.completed ? (
                            <motion.div
                              key="checked"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 600, damping: 25 }}
                            >
                              <CheckCircle2
                                size={22}
                                className="text-emerald-500"
                                style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))' }}
                              />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="unchecked"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <Circle
                                size={22}
                                className={`${overdue ? 'text-red-500' : 'text-gray-600'} hover:text-gray-400 transition-colors`}
                                strokeWidth={2}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`
                          text-base font-medium leading-snug mb-1
                          ${task.completed ? 'line-through text-gray-500' : 'text-white'}
                        `}>
                          {task.title}
                        </p>

                        {task.notes && (
                          <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                            {task.notes}
                          </p>
                        )}

                        {/* Tags */}
                        {(taskDate || task.reminder) && (
                          <div className="flex items-center gap-2">
                            {taskDate && (
                              <span className={`
                                text-xs px-2 py-0.5 rounded-md flex items-center gap-1
                                ${overdue
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-blue-500/10 text-blue-400'
                                }
                              `}>
                                <Calendar size={10} />
                                {taskDate}
                                {overdue && ' ⚠️'}
                              </span>
                            )}

                            {task.reminder && (
                              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 flex items-center gap-1">
                                <Bell size={10} />
                                {task.reminder}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Delete button */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteTask(task.id)}
                        className="flex-shrink-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty State */}
          {filteredTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">
                {filters.find(f => f.id === filter)?.emoji}
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {filter === 'completed' ? 'Пока нет выполненных' :
                 filter === 'today' ? 'Сегодня свободен' :
                 filter === 'upcoming' ? 'Ничего не запланировано' :
                 'Нет задач'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {filter === 'completed' ? 'Выполняйте задачи, они появятся здесь' : 'Создайте первую задачу'}
              </p>
              {filter !== 'completed' && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus size={20} className="inline mr-2" />
                  Добавить задачу
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewTask({ title: '', notes: '', when: null, reminder: null });
        }}
        title="Новая задача"
      >
        <div className="space-y-5">
          {/* Title */}
          <div>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Название задачи"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Notes */}
          <div>
            <textarea
              value={newTask.notes}
              onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
              placeholder="Заметки (опционально)"
              rows={3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none transition-colors"
            />
          </div>

          {/* Date Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSetDate('today')}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                newTask.when === 'today'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
              }`}
            >
              Сегодня
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleSetDate(tomorrow.toISOString().split('T')[0]);
              }}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                newTask.when && newTask.when !== 'today' && new Date(newTask.when).toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString()
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
              }`}
            >
              Завтра
            </button>
            <button
              onClick={() => setNewTask({ ...newTask, when: null })}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                !newTask.when
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
              }`}
            >
              Без даты
            </button>
          </div>

          {/* Date Picker */}
          <div>
            <input
              type="date"
              value={newTask.when && newTask.when !== 'today' ? newTask.when : ''}
              onChange={(e) => handleSetDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Reminder */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!newTask.reminder}
                onChange={(e) => setNewTask({ ...newTask, reminder: e.target.checked ? '09:00' : null })}
                className="w-5 h-5 rounded border-gray-700 bg-gray-800/50 text-blue-600"
              />
              <span className="text-sm text-gray-300">Добавить напоминание</span>
            </label>

            <AnimatePresence>
              {newTask.reminder && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <input
                    type="time"
                    value={newTask.reminder}
                    onChange={(e) => setNewTask({ ...newTask, reminder: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => {
                setShowAddModal(false);
                setNewTask({ title: '', notes: '', when: null, reminder: null });
              }}
              variant="secondary"
              fullWidth
            >
              Отмена
            </Button>
            <Button
              onClick={handleAddTask}
              variant="primary"
              fullWidth
              disabled={!newTask.title.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50"
            >
              Создать
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Tasks;
