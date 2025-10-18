import { motion } from 'framer-motion';
import { BookOpen, BarChart3, GraduationCap, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { haptic } from '../utils/telegram';

const Navigation = () => {
  const { t } = useTranslation();
  const { currentPage, setCurrentPage } = useStore();

  const navItems = [
    { id: 'journal', icon: BookOpen, label: t('nav.journal') },
    { id: 'insights', icon: BarChart3, label: t('nav.insights') },
    { id: 'study', icon: GraduationCap, label: t('nav.study') },
    { id: 'settings', icon: Settings, label: t('nav.settings') }
  ];

  const handleNavigate = (pageId) => {
    haptic.light();
    setCurrentPage(pageId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-md border-t border-gray-700 z-30">
      <div className="max-w-screen-lg mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors relative"
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon
                  size={24}
                  className={`relative z-10 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`text-xs font-medium relative z-10 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-gray-400'
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
