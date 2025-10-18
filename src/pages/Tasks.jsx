import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Inbox, Calendar, Star, Archive, Circle, CheckCircle2, ChevronRight, Bell, X } from 'lucide-react';
import { tasks, userStats } from '../db/database';
import { haptic } from '../utils/telegram';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Tasks = () => {
  const [activeList, setActiveList] = useState('inbox');
  const [inboxTasks, setInboxTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const [inbox, today, upcoming, completed] = await Promise.all([
      tasks.getInbox(),
      tasks.getToday(),
      tasks.getUpcoming(),
      tasks.getCompleted()
    ]);

    setInboxTasks(inbox);
    setTodayTasks(today);
    setUpcomingTasks(upcoming);
    setCompletedTasks(completed);
  };

  const handleToggleComplete = async (id) => {
    haptic.success();
    await tasks.toggleComplete(id);
    await userStats.updateTaskStats();
    loadTasks();
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    haptic.success();
    await tasks.create({
      title: newTaskTitle,
      list: activeList,
      when: activeList === 'today' ? 'today' : activeList === 'upcoming' ? new Date().toISOString().split('T')[0] : null
    });

    setNewTaskTitle('');
    setShowNewTask(false);
    await userStats.updateTaskStats();
    loadTasks();
  };

  const handleDeleteTask = async (id) => {
    haptic.light();
    await tasks.delete(id);
    await userStats.updateTaskStats();
    loadTasks();
  };

  const handleMoveToToday = async (id) => {
    haptic.light();
    await tasks.moveToToday(id);
    loadTasks();
  };

  const lists = [
    {
      id: 'inbox',
      name: 'Входящие',
      icon: Inbox,
      count: inboxTasks.length,
      color: 'text-blue-400',
      gradient: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'today',
      name: 'Сегодня',
      icon: Star,
      count: todayTasks.length,
      color: 'text-amber-400',
      gradient: 'from-amber-500/20 to-amber-600/20',
      borderColor: 'border-amber-500/30'
    },
    {
      id: 'upcoming',
      name: 'Запланировано',
      icon: Calendar,
      count: upcomingTasks.length,
      color: 'text-cyan-400',
      gradient: 'from-cyan-500/20 to-cyan-600/20',
      borderColor: 'border-cyan-500/30'
    },
    {
      id: 'completed',
      name: 'Архив',
      icon: Archive,
      count: completedTasks.length,
      color: 'text-emerald-400',
      gradient: 'from-emerald-500/20 to-emerald-600/20',
      borderColor: 'border-emerald-500/30'
    }
  ];

  const getCurrentTasks = () => {
    switch (activeList) {
      case 'inbox': return inboxTasks;
      case 'today': return todayTasks;
      case 'upcoming': return upcomingTasks;
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
      className="min-h-screen p-4 pb-24"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent tracking-tight">
            Задачи
          </h1>
        </div>

        {/* Lists Grid */}
        <div className="grid grid-cols-2 gap-3">
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
                    ? `bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl ${list.borderColor} shadow-lg`
                    : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/40'
                  }
                `}
              >
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${list.gradient} rounded-2xl`} />
                )}
                <div className="relative flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${list.gradient} flex items-center justify-center`}>
                    <Icon size={20} className={list.color} />
                  </div>
                  {list.count > 0 && (
                    <span className={`text-sm font-semibold ${isActive ? list.color : 'text-gray-400'}`}>
                      {list.count}
                    </span>
                  )}
                </div>
                <h3 className={`relative text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                  {list.name}
                </h3>
              </motion.button>
            );
          })}
        </div>

        {/* Active List Header */}
        {activeListData && activeList !== 'completed' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeListData.gradient} flex items-center justify-center`}>
                <activeListData.icon size={16} className={activeListData.color} />
              </div>
              <h2 className="text-xl font-medium text-white">
                {activeListData.name}
              </h2>
            </div>
            <Button
              onClick={() => setShowNewTask(true)}
              variant="secondary"
              size="sm"
            >
              <Plus size={18} />
              Новая
            </Button>
          </div>
        )}

        {activeList === 'completed' && (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeListData.gradient} flex items-center justify-center`}>
              <activeListData.icon size={16} className={activeListData.color} />
            </div>
            <h2 className="text-xl font-medium text-white">
              {activeListData.name}
            </h2>
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
              <Card className="p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-white/5">
                <div className="flex items-center gap-3">
                  <Circle size={20} className="text-blue-400/50 flex-shrink-0" />
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
                    placeholder="Название задачи..."
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
                  />
                  {newTaskTitle && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={handleAddTask}
                      className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    >
                      <Plus size={16} className="text-white" />
                    </motion.button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {currentTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: task.completed ? 100 : -100,
                  transition: { duration: 0.2 }
                }}
                layout
              >
                <Card className={`relative p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border-white/5 hover:shadow-lg transition-all group ${task.completed ? 'opacity-60' : ''}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${activeListData.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl`} />
                  <div className="relative flex items-start gap-3">
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
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          >
                            <CheckCircle2 size={22} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="unchecked"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Circle size={22} className="text-gray-600 hover:text-gray-500 transition-colors" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      <p className={`text-base transition-all ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                        {task.title}
                      </p>
                      {task.notes && (
                        <p className="text-sm text-gray-500 mt-1">
                          {task.notes}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {task.when && task.when !== 'today' && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>{new Date(task.when).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        )}
                        {task.reminder && (
                          <div className="flex items-center gap-1 text-xs text-amber-500">
                            <Bell size={12} />
                            <span>Напоминание</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!task.completed && (
                      <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {activeList !== 'today' && (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleMoveToToday(task.id)}
                            className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors"
                            title="В сегодня"
                          >
                            <Star size={14} className="text-amber-400" />
                          </motion.button>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                        >
                          <X size={14} className="text-red-400" />
                        </motion.button>
                      </div>
                    )}

                    {task.completed && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteTask(task.id)}
                        className="flex-shrink-0 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={18} />
                      </motion.button>
                    )}
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
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeListData?.gradient} mx-auto mb-4 flex items-center justify-center`}>
                <activeListData.icon size={32} className={activeListData?.color} />
              </div>
              <p className="text-gray-400 mb-4">
                {activeList === 'completed' ? 'Нет выполненных задач' : `Нет задач в "${activeListData?.name}"`}
              </p>
              {activeList !== 'completed' && (
                <Button
                  onClick={() => setShowNewTask(true)}
                  variant="secondary"
                  size="sm"
                >
                  Добавить задачу
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Tasks;
