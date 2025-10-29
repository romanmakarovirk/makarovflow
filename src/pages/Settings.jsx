import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { exportData, clearAllData } from '../db/database';
import { Globe, Download, Trash2, ChevronRight } from 'lucide-react';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { language, setLanguage, showToast } = useStore();

  const handleLanguageChange = async (newLang) => {
    await setLanguage(newLang);
    i18n.changeLanguage(newLang);
    showToast('Язык изменён', 'success');
  };

  const handleExportData = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindflow-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      showToast('Данные экспортированы', 'success');
    } catch (error) {
      showToast('Ошибка экспорта', 'error');
    }
  };

  const handleDeleteAll = async () => {
    if (confirm('⚠️ Удалить ВСЕ данные? Это действие необратимо!')) {
      try {
        await clearAllData();
        showToast('Все данные удалены', 'success');
      } catch (error) {
        showToast('Ошибка удаления', 'error');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen p-4 pb-24"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500 bg-clip-text text-transparent tracking-tight">
          Настройки
        </h1>

        {/* Language */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-5 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                <Globe className="text-blue-400" size={20} />
              </div>
              <h2 className="text-lg font-semibold">Язык</h2>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLanguageChange('ru')}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  language === 'ru'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'
                }`}
              >
                🇷🇺 Русский
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLanguageChange('en')}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  language === 'en'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'
                }`}
              >
                🇬🇧 English
              </motion.button>
            </div>
          </Card>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-5 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border-white/5">
            <h2 className="text-lg font-semibold mb-4">Данные</h2>

            <div className="space-y-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleExportData}
                className="w-full flex items-center justify-between p-4 bg-gray-800/40 hover:bg-gray-800/60 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                    <Download size={18} className="text-emerald-400" />
                  </div>
                  <span className="text-gray-300 font-medium">Экспортировать данные</span>
                </div>
                <ChevronRight size={18} className="text-gray-500 group-hover:text-gray-400 transition-colors" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleDeleteAll}
                className="w-full flex items-center justify-between p-4 bg-gray-800/40 hover:bg-red-500/10 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
                    <Trash2 size={18} className="text-red-400" />
                  </div>
                  <span className="text-gray-300 font-medium">Удалить все данные</span>
                </div>
                <ChevronRight size={18} className="text-gray-500 group-hover:text-red-400 transition-colors" />
              </motion.button>
            </div>
          </Card>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="p-5 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border-white/5">
            <h2 className="text-lg font-semibold mb-3">О приложении</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Версия</span>
                <span className="text-gray-300 font-medium">1.0.2</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Платформа</span>
                <span className="text-gray-300 font-medium">Telegram Mini App</span>
              </div>
              <div className="border-t border-gray-700/50 pt-3 mt-3">
                <p className="text-gray-500 text-xs text-center">
                  Made by Roman Makarov
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Settings;
