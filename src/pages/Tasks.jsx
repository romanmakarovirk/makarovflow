import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Bell, Trash2, Circle, CheckCircle2, X, Clock, Star, Inbox } from 'lucide-react';
import { tasks, userStats } from '../db/database';
import { haptic } from '../utils/telegram';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const Tasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // all, today, upcoming, completed
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
    { id: 'all', label: 'Все', count: allTasks.filter(t => !t.completed).length },
    { id: 'today', label: 'Сегодня', count: todayCount },
    { id: 'upcoming', label: 'Скоро', count: upcomingCount },
    { id: 'completed', label: 'Готово', count: completedCount }
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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
              Задачи
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {allTasks.filter(t => !t.completed).length} активных
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus size={20} />
            Новая
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((f) => (
            <motion.button
              key={f.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                haptic.light();
                setFilter(f.id);
              }}
              className={`
                px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2
                ${filter === f.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'
                }
              `}
            >
              {f.label}
              {f.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  filter === f.id ? 'bg-white/20' : 'bg-gray-700'
                }`}>
                  {f.count}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => {
              const taskDate = getTaskDate(task);
              const overdue = isOverdue(task);

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    x: task.completed ? 100 : -100,
                    transition: { duration: 0.2 }
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <Card className={`
                    p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-white/5
                    hover:shadow-xl hover:border-white/10 transition-all group relative overflow-hidden
                    ${task.completed ? 'opacity-60' : ''}
                    ${overdue ? 'border-red-500/30' : ''}
                  `}>
                    {/* Background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                    <div className="relative flex items-start gap-3">
                      {/* Checkbox */}
                      <motion.button
                        onClick={() => handleToggleComplete(task.id)}
                        className="flex-shrink-0 mt-1"
                        whileTap={{ scale: 0.85 }}
                      >
                        <AnimatePresence mode="wait">
                          {task.completed ? (
                            <motion.div
                              key="checked"
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 90 }}
                              transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                            >
                              <CheckCircle2
                                size={24}
                                className="text-emerald-500"
                                style={{
                                  filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))'
                                }}
                              />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="unchecked"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Circle
                                size={24}
                                className={`${overdue ? 'text-red-500' : 'text-gray-600'} hover:text-gray-500 transition-colors`}
                                strokeWidth={2.5}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`
                          text-base font-medium transition-all leading-relaxed
                          ${task.completed ? 'line-through text-gray-500' : 'text-white'}
                        `}>
                          {task.title}
                        </p>

                        {task.notes && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {task.notes}
                          </p>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {taskDate && (
                            <div className={`
                              flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                              ${overdue
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }
                            `}>
                              <Calendar size={12} />
                              <span>{taskDate}</span>
                              {overdue && <span className="ml-1">⚠️</span>}
                            </div>
                          )}

                          {task.reminder && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">
                              <Bell size={12} />
                              <span>Напоминание</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </motion.button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty State */}
          {filteredTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 mx-auto mb-4 flex items-center justify-center backdrop-blur-xl border border-white/10">
                {filter === 'completed' ? (
                  <CheckCircle2 size={40} className="text-emerald-400" />
                ) : filter === 'today' ? (
                  <Star size={40} className="text-amber-400" />
                ) : filter === 'upcoming' ? (
                  <Calendar size={40} className="text-blue-400" />
                ) : (
                  <Inbox size={40} className="text-gray-400" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {filter === 'completed' ? 'Нет выполненных задач' :
                 filter === 'today' ? 'Нет задач на сегодня' :
                 filter === 'upcoming' ? 'Нет предстоящих задач' :
                 'Нет активных задач'}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {filter === 'completed' ? 'Выполненные задачи появятся здесь' : 'Создайте первую задачу'}
              </p>
              {filter !== 'completed' && (
                <Button
                  onClick={() => setShowAddModal(true)}
                  variant="secondary"
                  size="md"
                >
                  <Plus size={20} />
                  Добавить задачу
                </Button>
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
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название *
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Купить молоко"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Заметки
            </label>
            <textarea
              value={newTask.notes}
              onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
              placeholder="Дополнительная информация..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Дата
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSetDate('today')}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  newTask.when === 'today'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'
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
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  newTask.when && newTask.when !== 'today' && new Date(newTask.when).toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString()
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'
                }`}
              >
                Завтра
              </button>
              <input
                type="date"
                value={newTask.when && newTask.when !== 'today' ? newTask.when : ''}
                onChange={(e) => handleSetDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {newTask.when && (
              <button
                onClick={() => handleSetDate(null)}
                className="mt-2 text-xs text-gray-500 hover:text-gray-400 transition-colors"
              >
                ✕ Очистить дату
              </button>
            )}
          </div>

          {/* Reminder */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!newTask.reminder}
                onChange={(e) => setNewTask({ ...newTask, reminder: e.target.checked ? '09:00' : null })}
                className="w-5 h-5 rounded border-gray-700 bg-gray-800/50 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-300">Напомнить</span>
            </label>
            {newTask.reminder && (
              <input
                type="time"
                value={newTask.reminder}
                onChange={(e) => setNewTask({ ...newTask, reminder: e.target.value })}
                className="mt-2 w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
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
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
