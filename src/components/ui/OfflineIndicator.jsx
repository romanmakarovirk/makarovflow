/**
 * Offline Indicator Component
 * Shows a banner when user is offline
 */

import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-2 text-center shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff size={16} />
            <span className="text-sm font-medium">
              Нет подключения к интернету
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
