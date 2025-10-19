import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Settings, CheckSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { haptic } from '../utils/telegram';

const Navigation = () => {
  const { t } = useTranslation();
  const { currentPage, setCurrentPage } = useStore();

  const navItems = [
    { id: 'journal', icon: BookOpen, label: 'Дневник', gradient: 'from-blue-500 to-purple-600' },
    { id: 'tasks', icon: CheckSquare, label: 'Задачи', gradient: 'from-cyan-500 to-blue-600' },
    { id: 'ai', icon: Sparkles, label: 'AI', gradient: 'from-purple-500 to-pink-600' },
    { id: 'settings', icon: Settings, label: 'Настройки', gradient: 'from-gray-500 to-gray-700' }
  ];

  const handleNavigate = (pageId) => {
    haptic.light();
    setCurrentPage(pageId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 pb-safe">
      {/* Enhanced Frosted Glass Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/98 via-gray-900/96 to-gray-900/85 backdrop-blur-3xl backdrop-saturate-[180%] rounded-t-[32px] border-t border-white/[0.1] shadow-[0_-12px_40px_rgba(0,0,0,0.5)]">
        {/* Dynamic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/[0.04] via-blue-500/[0.02] to-transparent rounded-t-[32px]" />
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent" />
      </div>

      <div className="relative max-w-screen-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-around gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className="flex flex-col items-center gap-1.5 px-5 py-2.5 rounded-[20px] transition-all relative min-w-[68px]"
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: isActive ? 1.02 : 1
                }}
                transition={{ duration: 0.2 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-[0.18] rounded-[20px] shadow-lg border border-white/[0.15]`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <motion.div
                  className="relative z-10"
                  animate={{
                    y: isActive ? -2 : 0
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon
                    size={23}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-all duration-200 ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}
                    style={isActive ? {
                      filter: 'drop-shadow(0 2px 6px rgba(147, 51, 234, 0.4))'
                    } : {}}
                  />
                </motion.div>

                <motion.span
                  className={`text-[10px] font-semibold relative z-10 transition-all duration-200 ${
                    isActive ? `bg-gradient-to-br ${item.gradient} bg-clip-text text-transparent font-bold` : 'text-gray-500'
                  }`}
                  animate={{
                    opacity: isActive ? 1 : 0.85
                  }}
                >
                  {item.label}
                </motion.span>

                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeDot"
                    className={`absolute -bottom-1 left-1/2 w-1 h-1 rounded-full bg-gradient-to-r ${item.gradient}`}
                    style={{ x: '-50%' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
