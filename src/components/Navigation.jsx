import { motion } from 'framer-motion';
import { BookOpen, BarChart3, GraduationCap, Settings, CheckSquare, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { haptic } from '../utils/telegram';

const Navigation = () => {
  const { t } = useTranslation();
  const { currentPage, setCurrentPage } = useStore();

  const navItems = [
    { id: 'journal', icon: BookOpen, label: t('nav.journal') },
    { id: 'tasks', icon: CheckSquare, label: 'Задачи' },
    { id: 'ai-chat', icon: Sparkles, label: 'AI' },
    { id: 'study', icon: GraduationCap, label: t('nav.study') },
    { id: 'settings', icon: Settings, label: t('nav.settings') }
  ];

  const handleNavigate = (pageId) => {
    haptic.light();
    setCurrentPage(pageId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 pb-safe bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl backdrop-saturate-150 border-t border-gray-200/20 dark:border-gray-800/20 shadow-[0_-2px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_-2px_16px_rgba(0,0,0,0.3)]">
      <div className="max-w-screen-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className="flex flex-col items-center gap-1.5 px-5 py-2.5 rounded-[28px] transition-all relative min-w-[72px]"
                whileTap={{ scale: 0.92 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-pink-500/20 dark:from-blue-500/25 dark:via-purple-500/20 dark:to-pink-500/25 backdrop-blur-xl rounded-[28px] shadow-lg border border-black/5 dark:border-white/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon
                  size={26}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`relative z-10 transition-all duration-300 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-300 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold relative z-10 transition-all duration-300 ${
                    isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
