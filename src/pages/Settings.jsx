import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import PremiumModal from '../components/premium/PremiumModal';
import { useStore } from '../store/useStore';
import { exportData, clearAllData, settings } from '../db/database';
import { Globe, Download, Trash2, Crown, Sun, Moon, Gift } from 'lucide-react';
import { haptic } from '../utils/telegram';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { language, setLanguage, theme, setTheme, showToast, checkPremium } = useStore();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  const languageOptions = [
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'English' }
  ];

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    await setLanguage(newLang);
    i18n.changeLanguage(newLang);
    showToast(t('common.success'), 'success');
  };

  const handleExportData = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindflow-export-${new Date().toISOString()}.json`;
      a.click();
      showToast(t('common.success'), 'success');
    } catch (error) {
      showToast(t('common.error'), 'error');
    }
  };

  const handleDeleteAll = async () => {
    if (confirm('Вы уверены? Все данные будут удалены безвозвратно.')) {
      try {
        await clearAllData();
        showToast(t('common.success'), 'success');
      } catch (error) {
        showToast(t('common.error'), 'error');
      }
    }
  };

  const handleActivatePromoCode = async () => {
    if (!promoCode.trim()) {
      showToast('Введите промо-код', 'error');
      return;
    }

    if (promoCode === 'RomanAdmin') {
      // Activate premium for 30 days
      const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 дней
      await settings.activatePremium(expiresAt);
      await checkPremium();
      setPromoCode('');
      haptic.success();
      showToast('Premium активирован на 30 дней!', 'success');
    } else {
      haptic.error();
      showToast('Неверный промо-код', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen p-4"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          {t('settings.title')}
        </h1>

        {/* Language */}
        <Card className="p-6 light:bg-white light:border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="text-blue-400" size={24} />
            <h2 className="text-xl font-semibold light:text-gray-900">{t('settings.language')}</h2>
          </div>
          <Select
            value={language}
            onChange={handleLanguageChange}
            options={languageOptions}
          />
        </Card>

        {/* Theme */}
        <Card className="p-6 light:bg-white light:border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            {theme === 'dark' ? (
              <Moon className="text-indigo-400" size={24} />
            ) : (
              <Sun className="text-amber-400" size={24} />
            )}
            <h2 className="text-xl font-semibold light:text-gray-900">Тема</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                haptic.light();
                setTheme('dark');
                showToast('Тёмная тема активирована', 'success');
              }}
              className={`p-4 rounded-2xl border-2 transition-all ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-gray-700 bg-gray-800/30 light:border-gray-300 light:bg-gray-50'
              }`}
            >
              <Moon size={24} className={`mx-auto mb-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-gray-500'}`} />
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-400 light:text-gray-600'}`}>
                Тёмная
              </p>
            </button>
            <button
              onClick={() => {
                haptic.light();
                setTheme('light');
                showToast('Светлая тема активирована', 'success');
              }}
              className={`p-4 rounded-2xl border-2 transition-all ${
                theme === 'light'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-gray-700 bg-gray-800/30 light:border-gray-300 light:bg-gray-50'
              }`}
            >
              <Sun size={24} className={`mx-auto mb-2 ${theme === 'light' ? 'text-amber-400' : 'text-gray-500'}`} />
              <p className={`text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-gray-400 light:text-gray-600'}`}>
                Светлая
              </p>
            </button>
          </div>
        </Card>

        {/* Data */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('settings.data')}</h2>
          <div className="space-y-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={handleExportData}
            >
              <Download size={20} />
              {t('settings.exportData')}
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleDeleteAll}
            >
              <Trash2 size={20} />
              {t('settings.deleteAllData')}
            </Button>
          </div>
        </Card>

        {/* Promo Code */}
        <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/30 dark:bg-gradient-to-br dark:from-purple-500/10 dark:to-pink-600/10 dark:border-purple-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="text-purple-400" size={24} />
            <h2 className="text-xl font-semibold text-purple-400 dark:text-purple-400">Промо-код</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">Введите промо-код для активации Premium</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Введите код"
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Button onClick={handleActivatePromoCode} variant="primary" className="sm:w-auto w-full whitespace-nowrap">
              Активировать
            </Button>
          </div>
        </Card>

        {/* Premium */}
        <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border border-yellow-500/30 dark:bg-gradient-to-br dark:from-yellow-500/10 dark:to-orange-600/10 dark:border-yellow-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="text-yellow-400" size={28} />
            <h2 className="text-xl font-semibold text-yellow-400">{t('premium.title')}</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{t('premium.aiDescription')}</p>
          <Button variant="primary" fullWidth onClick={() => setShowPremiumModal(true)}>
            {t('premium.tryPremium')}
          </Button>
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center mt-2">{t('premium.price')}</p>
        </Card>

        {/* Premium Modal */}
        <PremiumModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
        />

        {/* About */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('settings.about')}</h2>
          <div className="space-y-2 text-gray-400">
            <p>{t('settings.version')}: 1.0.0</p>
            <p className="text-xs mt-4">
              Made for Roman Makarov
            </p>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default Settings;
