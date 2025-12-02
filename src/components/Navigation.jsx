import { BookOpen, Sparkles, Settings, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { haptic } from '../utils/telegram';

const Navigation = () => {
  const { t } = useTranslation();
  const { currentPage, setCurrentPage } = useStore();

  // Определяем цвет фона навигации в зависимости от текущей страницы
  // Светлый frosted glass эффект в стиле Apple
  const getNavBackground = () => {
    return 'rgba(255, 255, 255, 0.7)'; // Белый с прозрачностью для frosted glass
  };

  const navItems = [
    { id: 'journal', icon: BookOpen, label: 'Дневник' },
    { id: 'tasks', icon: CheckSquare, label: 'Задачи' },
    { id: 'ai', icon: Sparkles, label: 'AI' },
    { id: 'settings', icon: Settings, label: 'Настройки' }
  ];

  const handleNavigate = (pageId) => {
    if (currentPage === pageId) return;
    haptic.light();
    setCurrentPage(pageId);
  };

  return (
    // Telegram-style Liquid Glass Navigation Bar
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-7 pointer-events-none will-change-transform">
      {/* Outer glow effect - создает мягкое свечение вокруг панели */}
      <div
        className="absolute inset-0 blur-xl opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center bottom, rgba(0, 122, 255, 0.2), transparent 70%)'
        }}
      />

      {/* Main Navigation Container - Glass morphism эффект */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative mx-auto max-w-md pointer-events-auto"
        style={{
          // Liquid Glass эффект в стиле Apple iOS
          background: getNavBackground(),
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderRadius: '28px',
          // Apple-style тени для светлой темы
          boxShadow: `
            0 10px 40px rgba(0, 0, 0, 0.08),
            0 2px 8px rgba(0, 0, 0, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            inset 0 -1px 0 rgba(0, 0, 0, 0.05)
          `,
          // Тонкая граница для эффекта стекла
          border: '0.5px solid rgba(0, 0, 0, 0.1)',
          // Hardware acceleration fix для анимации
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
      >
        {/* Верхнее отражение света - как на стекле */}
        <div
          className="absolute inset-x-0 top-0 h-1/3 pointer-events-none rounded-t-[28px]"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, transparent 100%)'
          }}
        />

        {/* Navigation Items Container */}
        <div className="relative px-4 py-3 flex items-center justify-around gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className="relative flex flex-col items-center gap-1.5 px-4 py-2 min-w-[72px]"
                // Плавная анимация при нажатии
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.15 }}
              >
                {/* Активный фон - pill-образная форма (как в iOS) */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-[20px]"
                    style={{
                      // Светлый акцентный фон для активной вкладки - Apple blue
                      background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.15), rgba(0, 122, 255, 0.1))',
                      boxShadow: 'inset 0 0 0 0.5px rgba(0, 122, 255, 0.2)'
                    }}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{
                      duration: 0.2,
                      ease: 'easeInOut'
                    }}
                  />
                )}

                {/* Icon - крупнее чем раньше */}
                <motion.div
                  className="relative z-10"
                  animate={{
                    scale: isActive ? 1.08 : 1,
                    y: isActive ? -2 : 0
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon
                    size={28}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}
                    style={{
                      // Легкое свечение для активной иконки
                      filter: isActive ? 'drop-shadow(0 2px 4px rgba(0, 122, 255, 0.3))' : 'none'
                    }}
                  />
                </motion.div>

                {/* Label text */}
                <motion.span
                  className={`text-[10px] font-semibold relative z-10 transition-all duration-200 ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                  animate={{
                    opacity: isActive ? 1 : 0.7
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
};

export default Navigation;
