import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from './store/useStore';

// Pages
import Journal from './pages/Journal';
import Tasks from './pages/Tasks';
import Insights from './pages/Insights';
import Study from './pages/Study';
import Settings from './pages/Settings';

// Components
import Navigation from './components/Navigation';
import Toast from './components/ui/Toast';

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">{t('common.loading')}</div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'journal':
        return <Journal />;
      case 'tasks':
        return <Tasks />;
      case 'insights':
        return <Insights />;
      case 'study':
        return <Study />;
      case 'settings':
        return <Settings />;
      default:
        return <Journal />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {renderPage()}
      <Navigation />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default App;
