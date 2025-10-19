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
      {/* iOS 26 Frosted Glass Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/98 via-gray-900/95 to-gray-900/80 backdrop-blur-3xl backdrop-saturate-200 rounded-t-[40px] border-t border-white/[0.08] shadow-[0_-20px_60px_rgba(0,0,0,0.4)]">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/[0.03] via-blue-500/[0.02] to-transparent rounded-t-[40px]" />
        {/* Noise texture for depth */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay rounded-t-[40px]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'4\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px'
        }} />
      </div>

      <div className="relative max-w-screen-lg mx-auto px-6 py-4">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className="flex flex-col items-center gap-2 px-4 py-2 rounded-[24px] transition-all relative min-w-[70px]"
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.05 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20 backdrop-blur-2xl rounded-[24px] shadow-2xl border border-white/[0.12]`}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-white/[0.05] to-transparent rounded-[24px]" />
                  </motion.div>
                )}
                <div className="relative z-10">
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}
                    style={isActive ? {
                      filter: 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.6))'
                    } : {}}
                  />
                </div>
                <span
                  className={`text-[10px] font-semibold relative z-10 transition-all duration-300 ${
                    isActive ? `bg-gradient-to-br ${item.gradient} bg-clip-text text-transparent` : 'text-gray-500'
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
