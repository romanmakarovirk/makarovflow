import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Circle, CheckCircle2, ChevronRight, Inbox, Star, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { tasks, userStats } from '../db/database';
import { haptic } from '../utils/telegram';

const Tasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [selectedList, setSelectedList] = useState('inbox'); // inbox, today, upcoming, someday
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [processingIds, setProcessingIds] = useState(new Set()); // Track processing tasks

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const all = await tasks.getAll();
    setAllTasks(all);
  };

  const handleToggleComplete = async (id) => {
    // Prevent double-click race condition
    if (processingIds.has(id)) return;
    
    setProcessingIds(prev => new Set(prev).add(id));
    
    try {
      haptic.success();
      await tasks.toggleComplete(id);
      await userStats.updateTaskStats();
      await loadTasks(); // Wait for load to complete
    } catch (error) {
      console.error('Error toggling task:', error);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    // Basic validation
    if (newTaskTitle.length > 500) {
      return; // Title too long
    }

    try {
      haptic.success();
      await tasks.create({
        title: newTaskTitle.trim(),
        notes: '',
        when: selectedList === 'today' ? 'today' : null,
        list: selectedList,
        reminder: null
      });

      setNewTaskTitle('');
      setShowAddTask(false);
      await userStats.updateTaskStats();
      await loadTasks(); // Wait for load to complete
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Things 3 style - группировка задач по спискам (мемоизировано)
  const { inboxTasks, todayTasks, upcomingTasks, somedayTasks, completedTasks } = useMemo(() => {
    const getTasksByList = (listId) => {
      return allTasks.filter(t => !t.completed && t.list === listId);
    };

    return {
      inboxTasks: getTasksByList('inbox'),
      todayTasks: getTasksByList('today'),
      upcomingTasks: getTasksByList('upcoming'),
      somedayTasks: getTasksByList('someday'),
      completedTasks: allTasks.filter(t => t.completed)
    };
  }, [allTasks]);

  // Things 3 style - списки с иконками и счетчиками (мемоизировано)
  const lists = useMemo(() => [
    { id: 'inbox', label: 'Входящие', icon: Inbox, count: inboxTasks.length, color: '#4A90E2' },
    { id: 'today', label: 'Сегодня', icon: Star, count: todayTasks.length, color: '#F5A623' },
    { id: 'upcoming', label: 'Предстоящие', icon: CalendarIcon, count: upcomingTasks.length, color: '#7ED321' },
    { id: 'someday', label: 'Когда-нибудь', icon: Clock, count: somedayTasks.length, color: '#9013FE' }
  ], [inboxTasks.length, todayTasks.length, upcomingTasks.length, somedayTasks.length]);

  // Мемоизированные вычисления для текущих задач
  const currentTasks = useMemo(() => {
    switch (selectedList) {
      case 'inbox': return inboxTasks;
      case 'today': return todayTasks;
      case 'upcoming': return upcomingTasks;
      case 'someday': return somedayTasks;
      default: return inboxTasks;
    }
  }, [selectedList, inboxTasks, todayTasks, upcomingTasks, somedayTasks]);

  const currentListData = useMemo(() => {
    return lists.find(l => l.id === selectedList);
  }, [selectedList, lists]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-4 pb-24"
    >
      {/* Things 3 style - боковые списки слева (упрощенная версия для мобильного) */}
      <div className="pb-2">
        {/* Things 3 style - горизонтальные списки для мобильного */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {lists.map((list) => {
            const Icon = list.icon;
            const isActive = selectedList === list.id;

            return (
              <motion.button
                key={list.id}
                onClick={() => {
                  haptic.light();
                  setSelectedList(list.id);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'bg-transparent text-gray-500'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={16} style={{ color: isActive ? list.color : '#6c6c70' }} />
                <span>{list.label}</span>
                {list.count > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-md text-xs font-bold"
                    style={{
                      background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(108, 108, 112, 0.3)',
                      color: isActive ? '#ffffff' : '#8e8e93'
                    }}
                  >
                    {list.count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Things 3 style - основная область с задачами */}
      <div>
        {/* Things 3 style - заголовок раздела */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <h1 className="text-2xl font-bold text-white">
            {currentListData?.label}
          </h1>

          {/* Things 3 style - кнопка добавления (круглая, в правом верхнем углу) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAddTask(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: currentListData?.color || '#4A90E2',
              boxShadow: `0 2px 8px ${currentListData?.color}40`
            }}
          >
            <Plus size={20} className="text-white" strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Things 3 style - поле быстрого добавления задачи */}
        <AnimatePresence>
          {showAddTask && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="mb-4 overflow-hidden"
            >
              <div
                className="rounded-xl p-3 flex flex-col gap-3"
                style={{ background: '#2C2C2E' }}
              >
                {/* Верхняя часть - чекбокс и поле ввода */}
                <div className="flex items-center gap-3">
                  {/* Things 3 style - чекбокс слева */}
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0" />

                  {/* Поле ввода */}
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleAddTask();
                      if (e.key === 'Escape') setShowAddTask(false);
                    }}
                    placeholder="Новая задача"
                    className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-[15px]"
                    autoFocus
                  />
                </div>

                {/* Кнопки действий - отдельной строкой снизу */}
                <div className="flex gap-2 justify-end">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAddTask(false)}
                    className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-700/30 transition-colors"
                  >
                    Отмена
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAddTask}
                    disabled={!newTaskTitle.trim()}
                    className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                    style={{ background: currentListData?.color }}
                  >
                    Добавить
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Things 3 style - список задач */}
        <div className="space-y-0">
          <AnimatePresence mode="popLayout">
            {currentTasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: 100,
                  scale: 0.8,
                  height: 0,
                  transition: {
                    opacity: { duration: 0.3 },
                    x: { duration: 0.4, ease: 'easeIn' },
                    scale: { duration: 0.4 },
                    height: { duration: 0.3, delay: 0.2 }
                  }
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 35,
                  opacity: { duration: 0.2 }
                }}
                className="relative"
              >
                {/* Things 3 style - карточка задачи */}
                <motion.div
                  className="flex items-center gap-3 px-4 py-3.5 relative group"
                  style={{ background: '#2C2C2E' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Things 3 style - чекбокс слева (круглый) */}
                  <motion.button
                    onClick={() => handleToggleComplete(task.id)}
                    className="flex-shrink-0"
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <AnimatePresence mode="wait">
                      {task.completed ? (
                        <motion.div
                          key="checked"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{
                            scale: [0, 1.3, 1],
                            rotate: [0, 10, 0]
                          }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 15,
                            duration: 0.6
                          }}
                        >
                          <CheckCircle2
                            size={22}
                            className="text-emerald-500"
                            fill="currentColor"
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
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 25
                          }}
                        >
                          <Circle
                            size={22}
                            className="text-gray-600 hover:text-gray-500 transition-colors"
                            strokeWidth={2}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Things 3 style - текст задачи */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[15px] leading-tight transition-all duration-200 ${
                        task.completed
                          ? 'line-through text-gray-600'
                          : 'text-white'
                      }`}
                    >
                      {task.title}
                    </p>

                    {/* Things 3 style - подзаголовок/заметка */}
                    {task.notes && (
                      <p className="text-[13px] text-gray-500 mt-1 line-clamp-1">
                        {task.notes}
                      </p>
                    )}
                  </div>

                  {/* Things 3 style - стрелка справа (показывается при наведении) */}
                  <ChevronRight
                    size={18}
                    className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  />
                </motion.div>

                {/* Things 3 style - тонкий разделитель между задачами */}
                {index < currentTasks.length - 1 && (
                  <div
                    className="h-[0.5px] ml-14"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Things 3 style - пустое состояние */}
          {currentTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              {currentListData && (
                <>
                  <div className="mb-4">
                    <currentListData.icon
                      size={56}
                      className="mx-auto"
                      style={{ color: currentListData.color, opacity: 0.3 }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-[17px] font-medium text-gray-500 mb-2">
                    {selectedList === 'today' ? 'Ничего на сегодня' :
                     selectedList === 'inbox' ? 'Входящие пусты' :
                     selectedList === 'upcoming' ? 'Нет запланированных задач' :
                     'Нет задач на потом'}
                  </h3>
                  <p className="text-[14px] text-gray-600 mb-6">
                    Нажмите + чтобы добавить задачу
                  </p>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Things 3 style - раздел выполненных задач (если есть) */}
        {completedTasks.length > 0 && selectedList === 'today' && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-gray-500 mb-2 px-4">
              Выполнено
            </h2>
            <div className="space-y-0">
              {completedTasks.slice(0, 5).map((task, index) => (
                <div key={task.id} className="relative">
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ background: '#2C2C2E' }}
                  >
                    <CheckCircle2
                      size={22}
                      className="text-emerald-500 flex-shrink-0"
                      fill="currentColor"
                      style={{ opacity: 0.6 }}
                    />
                    <p className="text-[15px] text-gray-600 line-through flex-1">
                      {task.title}
                    </p>
                  </div>
                  {index < Math.min(completedTasks.length, 5) - 1 && (
                    <div
                      className="h-[0.5px] ml-14"
                      style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Tasks;
