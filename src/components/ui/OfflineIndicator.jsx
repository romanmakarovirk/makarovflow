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
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-red-500/90 text-white px-4 py-3 text-center shadow-[0_8px_32px_rgba(239,68,68,0.3)] border-b border-red-400/20"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff size={18} strokeWidth={2.5} />
            <span className="text-sm font-semibold">
              Нет подключения к интернету
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
