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
      className="min-h-screen p-4 pb-24"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
          {t('study.title')}
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
                }`}
              >
                <Icon size={20} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
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
