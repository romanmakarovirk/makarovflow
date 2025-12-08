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
    <div className="relative min-h-screen pb-24 text-slate-100 theme-midnight overflow-hidden bg-gradient-to-br from-[#0f1419] via-[#121620] to-[#0d1117]">
      {/* Ambient glows - более светлые и мягкие */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            'radial-gradient(circle at 20% 25%, rgba(124, 58, 237, 0.12), transparent 40%),' +
            'radial-gradient(circle at 80% 20%, rgba(34, 211, 238, 0.10), transparent 35%),' +
            'radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.10), transparent 30%),' +
            'linear-gradient(145deg, rgba(20, 24, 35, 0.6), rgba(15, 18, 28, 0.7))'
        }}
      />

      {/* Тонкая временная линия слева как в планировщике */}
      <div className="pointer-events-none absolute left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-purple-400/40 to-transparent -z-10" />

      <div className="relative z-10 px-4 sm:px-6 pt-6">
        <OfflineIndicator />
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-slate-200 text-xl font-medium">{t('common.loading')}</div>
          </div>
        }>
          {renderPage()}
        </Suspense>
        <Navigation />
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}

export default App;
