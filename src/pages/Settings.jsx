import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import PremiumModal from '../components/premium/PremiumModal';
import { useStore } from '../store/useStore';
import { exportData, clearAllData } from '../db/database';
import { Globe, Download, Trash2, Crown } from 'lucide-react';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { language, setLanguage, showToast } = useStore();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

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
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="text-blue-400" size={24} />
            <h2 className="text-xl font-semibold">{t('settings.language')}</h2>
          </div>
          <Select
            value={language}
            onChange={handleLanguageChange}
            options={languageOptions}
          />
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

        {/* Premium */}
        <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="text-yellow-400" size={28} />
            <h2 className="text-xl font-semibold text-yellow-400">{t('premium.title')}</h2>
          </div>
          <p className="text-gray-300 mb-4">{t('premium.aiDescription')}</p>
          <Button variant="primary" fullWidth onClick={() => setShowPremiumModal(true)}>
            {t('premium.tryPremium')}
          </Button>
          <p className="text-gray-400 text-sm text-center mt-2">{t('premium.price')}</p>
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
