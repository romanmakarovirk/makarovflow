import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Inbox, Calendar, Clock, Star, CheckCircle2, Circle, ChevronRight, Send, Bell, X } from 'lucide-react';
import { tasks } from '../db/database';
import { haptic } from '../utils/telegram';
import Card from '../components/ui/Card';

const Tasks = () => {
  const [activeList, setActiveList] = useState('inbox');
  const [inboxTasks, setInboxTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [somedayTasks, setSomedayTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderTime, setReminderTime] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const [inbox, today, upcoming, someday, completed] = await Promise.all([
      tasks.getInbox(),
      tasks.getToday(),
      tasks.getUpcoming(),
      tasks.getSomeday(),
      tasks.getCompleted()
    ]);

    setInboxTasks(inbox);
    setTodayTasks(today);
    setUpcomingTasks(upcoming);
    setSomedayTasks(someday);
    setCompletedTasks(completed);
  };

  const handleToggleComplete = async (id) => {
    haptic.light();
    await tasks.toggleComplete(id);
    loadTasks();
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    haptic.success();
    await tasks.create({
      title: newTaskTitle,
      list: activeList,
      when: activeList === 'today' ? 'today' : activeList === 'someday' ? 'someday' : null
    });

    setNewTaskTitle('');
    setShowNewTask(false);
    loadTasks();
  };

  const handleDeleteTask = async (id) => {
    haptic.light();
    await tasks.delete(id);
    loadTasks();
  };

  const handleSetReminder = async (taskId) => {
    setSelectedTaskId(taskId);
    setShowReminderPicker(true);
    haptic.light();
  };

  const handleSaveReminder = async () => {
    if (!reminderTime || !selectedTaskId) return;

    const reminderTimestamp = new Date(reminderTime).getTime();
    await tasks.update(selectedTaskId, { reminder: reminderTimestamp });

    setShowReminderPicker(false);
    setSelectedTaskId(null);
    setReminderTime('');
    loadTasks();
    haptic.success();
  };

  const handleRemoveReminder = async (taskId) => {
    await tasks.update(taskId, { reminder: null });
    loadTasks();
    haptic.light();
  };

  const lists = [
    {
      id: 'inbox',
      name: 'Входящие',
      icon: Inbox,
      count: inboxTasks.length,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'today',
      name: 'Сегодня',
      icon: Star,
      count: todayTasks.length,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
    {
      id: 'upcoming',
      name: 'Запланировано',
      icon: Calendar,
      count: upcomingTasks.length,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10'
    },
    {
      id: 'someday',
      name: 'Когда-нибудь',
      icon: Clock,
      count: somedayTasks.length,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10'
    },
    {
      id: 'completed',
      name: 'Выполнено',
      icon: CheckCircle2,
      count: completedTasks.length,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    }
  ];

  const getCurrentTasks = () => {
    switch (activeList) {
      case 'inbox': return inboxTasks;
      case 'today': return todayTasks;
      case 'upcoming': return upcomingTasks;
      case 'someday': return somedayTasks;
      case 'completed': return completedTasks;
      default: return [];
    }
  };

  const currentTasks = getCurrentTasks();
  const activeListData = lists.find(l => l.id === activeList);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen p-4 pb-32"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Задачи
          </h1>
        </div>

        {/* Lists Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* First 4 lists in 2x2 grid */}
          {lists.map((list) => {
            const Icon = list.icon;
            const isActive = activeList === list.id;

            return (
              <motion.button
                key={list.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  haptic.light();
                  setActiveList(list.id);
                  setShowNewTask(false);
                }}
                className={`
                  relative p-4 rounded-2xl border transition-all text-left
                  ${isActive
                    ? 'bg-gray-800/60 border-gray-600'
                    : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/40'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${list.bgColor} flex items-center justify-center`}>
                    <Icon size={20} className={list.color} />
                  </div>
                  {list.count > 0 && (
                    <span className="text-sm font-semibold text-gray-400">
                      {list.count}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-300">
                  {list.name}
                </h3>
              </motion.button>
            );
          })}
        </div>

        {/* Active List Header */}
        {activeListData && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${activeListData.bgColor} flex items-center justify-center`}>
                <activeListData.icon size={16} className={activeListData.color} />
              </div>
              <h2 className="text-xl font-medium text-white">
                {activeListData.name}
              </h2>
            </div>
            {activeList !== 'completed' && (
              <button
                onClick={() => setShowNewTask(true)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <Plus size={20} className="text-gray-400" />
              </button>
            )}
          </div>
        )}

        {/* New Task Input */}
        <AnimatePresence>
          {showNewTask && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="p-3 bg-gray-800/40 border-gray-700/50">
                <div className="flex items-center gap-2">
                  <Circle size={20} className="text-gray-600 flex-shrink-0" />
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTask();
                      if (e.key === 'Escape') {
                        setShowNewTask(false);
                        setNewTaskTitle('');
                      }
                    }}
                    onFocus={(e) => {
                      // Scroll input into view when keyboard appears
                      setTimeout(() => {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                    }}
                    placeholder="Новая задача"
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-white light:text-gray-900 placeholder-gray-500 light:placeholder-gray-400"
                  />
                  <motion.button
                    onClick={handleAddTask}
                    disabled={!newTaskTitle.trim()}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                  >
                    <Send size={16} className="text-white" />
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks List */}
        <div className="space-y-2">
          <AnimatePresence>
            {currentTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
              >
                <Card className="p-4 bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/40 transition-all">
                  <div className="flex items-start gap-3">
                    <motion.button
                      onClick={() => handleToggleComplete(task.id)}
                      className="flex-shrink-0 mt-0.5"
                      whileTap={{ scale: 0.9 }}
                    >
                      <AnimatePresence mode="wait">
                        {task.completed ? (
                          <motion.div
                            key="checked"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          >
                            <CheckCircle2 size={20} className="text-emerald-500" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="unchecked"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Circle size={20} className="text-gray-600 hover:text-gray-500 transition-colors" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      <p className={`text-base ${task.completed ? 'line-through text-gray-500' : 'text-white light:text-gray-900'}`}>
                        {task.title}
                      </p>
                      {task.notes && (
                        <p className="text-sm text-gray-500 mt-1">
                          {task.notes}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {task.when && task.when !== 'today' && task.when !== 'someday' && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>{new Date(task.when).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        )}
                        {task.reminder && (
                          <div className="flex items-center gap-1 text-xs text-cyan-400">
                            <Bell size={12} />
                            <span>{new Date(task.reminder).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveReminder(task.id);
                              }}
                              className="ml-1 hover:text-red-400 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!task.completed && !task.reminder && (
                        <button
                          onClick={() => handleSetReminder(task.id)}
                          className="p-1.5 text-gray-600 hover:text-cyan-400 transition-colors"
                        >
                          <Bell size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {currentTasks.length === 0 && !showNewTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className={`w-16 h-16 rounded-2xl ${activeListData?.bgColor} mx-auto mb-4 flex items-center justify-center`}>
                <activeListData.icon size={32} className={activeListData?.color} />
              </div>
              <p className="text-gray-400 mb-4">
                Нет задач в "{activeListData?.name}"
              </p>
              <button
                onClick={() => setShowNewTask(true)}
                className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
              >
                Добавить задачу
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Reminder Picker Modal */}
      <AnimatePresence>
        {showReminderPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowReminderPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <Card className="p-6 bg-gray-800 border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Установить напоминание</h3>
                  <button
                    onClick={() => setShowReminderPicker(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Дата и время</label>
                    <input
                      type="datetime-local"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowReminderPicker(false)}
                      className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl text-gray-300 font-medium transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleSaveReminder}
                      disabled={!reminderTime}
                      className="flex-1 px-4 py-3 bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Сохранить
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Tasks;
