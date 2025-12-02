import { useEffect, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from './store/useStore';

// Lazy load pages for better performance
const Journal = lazy(() => import('./pages/Journal'));
const Tasks = lazy(() => import('./pages/Tasks'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const Settings = lazy(() => import('./pages/Settings'));

// Components (loaded immediately as they're small)
import Navigation from './components/Navigation';
import Toast from './components/ui/Toast';
import OfflineIndicator from './components/ui/OfflineIndicator';

function App() {
  const { t } = useTranslation();
  const { currentPage, initialize, toast } = useStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initialize();
      setIsInitialized(true);
    };
    init();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-800 text-xl font-medium">{t('common.loading')}</div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'journal':
        return <Journal />;
      case 'tasks':
        return <Tasks />;
      case 'ai':
        return <AIAssistant />;
      case 'settings':
        return <Settings />;
      default:
        return <Journal />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 text-gray-900 pb-20">
      <OfflineIndicator />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-800 text-xl font-medium">{t('common.loading')}</div>
        </div>
      }>
        {renderPage()}
      </Suspense>
      <Navigation />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default App;
