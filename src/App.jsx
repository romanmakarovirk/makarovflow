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
    <div className="relative min-h-screen pb-24 text-slate-100 theme-midnight overflow-hidden bg-[#050912]">
      {/* Ambient glows to mirror the sleep dashboard feel */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-90"
        style={{
          background:
            'radial-gradient(circle at 18% 22%, rgba(124, 58, 237, 0.18), transparent 35%),' +
            'radial-gradient(circle at 82% 18%, rgba(34, 211, 238, 0.18), transparent 32%),' +
            'radial-gradient(circle at 70% 78%, rgba(59, 130, 246, 0.16), transparent 30%),' +
            'linear-gradient(145deg, rgba(20, 24, 45, 0.9), rgba(7, 11, 26, 0.95))'
        }}
      />

      {/* Thin timeline glow inspired by the screenshot */}
      <div className="pointer-events-none absolute left-6 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-purple-500/60 to-transparent blur-[1px] -z-10" />

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
