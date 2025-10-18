import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, CheckSquare, Calculator } from 'lucide-react';
import ScheduleTab from '../components/study/ScheduleTab';
import HomeworkTab from '../components/study/HomeworkTab';
import CalculatorsTab from '../components/study/CalculatorsTab';
import { haptic } from '../utils/telegram';

const Study = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('schedule');

  const tabs = [
    { id: 'schedule', name: 'Расписание', icon: Calendar },
    { id: 'homework', name: 'Домашка', icon: CheckSquare },
    { id: 'calculators', name: 'Калькуляторы', icon: Calculator }
  ];

  const handleTabChange = (tabId) => {
    haptic.light();
    setActiveTab(tabId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen p-4 pb-24 light:bg-gray-50"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent">
            {t('study.title')}
          </h1>
        </div>

        {/* Tabs - Modern pill style */}
        <div className="sticky top-0 z-10 bg-gray-900/80 light:bg-gray-50/80 backdrop-blur-xl rounded-2xl p-1.5 border border-gray-800 light:border-gray-200 shadow-lg">
          <div className="grid grid-cols-3 gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 light:text-gray-600 hover:text-gray-300 light:hover:text-gray-800'
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-xl shadow-lg"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon size={18} className="relative z-10" />
                  <span className="relative z-10 text-sm font-semibold hidden sm:inline">
                    {tab.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Tab Content with enhanced animations */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {activeTab === 'schedule' && <ScheduleTab />}
          {activeTab === 'homework' && <HomeworkTab />}
          {activeTab === 'calculators' && <CalculatorsTab />}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Study;
