import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Inbox, Calendar, Clock, Star, CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { tasks } from '../db/database';
import { haptic } from '../utils/telegram';
import Card from '../components/ui/Card';

const Tasks = () => {
  const [activeList, setActiveList] = useState('inbox');
  const [inboxTasks, setInboxTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [somedayTasks, setSomedayTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const [inbox, today, upcoming, someday] = await Promise.all([
      tasks.getInbox(),
      tasks.getToday(),
      tasks.getUpcoming(),
      tasks.getSomeday()
    ]);

    setInboxTasks(inbox);
    setTodayTasks(today);
    setUpcomingTasks(upcoming);
    setSomedayTasks(someday);
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
    }
  ];

  const getCurrentTasks = () => {
    switch (activeList) {
      case 'inbox': return inboxTasks;
      case 'today': return todayTasks;
      case 'upcoming': return upcomingTasks;
      case 'someday': return somedayTasks;
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
          <h1 className="text-3xl font-semibold text-white tracking-tight">
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
            <button
              onClick={() => setShowNewTask(true)}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <Plus size={20} className="text-gray-400" />
            </button>
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
              <Card className="p-4 bg-gray-800/40 border-gray-700/50">
                <div className="flex items-center gap-3">
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
                    placeholder="Новая задача"
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
                  />
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
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      className="flex-shrink-0 mt-0.5"
                    >
                      {task.completed ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : (
                        <Circle size={20} className="text-gray-600 hover:text-gray-500 transition-colors" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`text-base ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                        {task.title}
                      </p>
                      {task.notes && (
                        <p className="text-sm text-gray-500 mt-1">
                          {task.notes}
                        </p>
                      )}
                      {task.when && task.when !== 'today' && task.when !== 'someday' && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <Calendar size={12} />
                          <span>{new Date(task.when).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="flex-shrink-0 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight size={18} />
                    </button>
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
    </motion.div>
  );
};

export default Tasks;
