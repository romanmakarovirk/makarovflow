import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'success' }) => {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />
  };

  const colors = {
    success: 'bg-green-500/10 border-green-500/30 text-green-700',
    error: 'bg-red-500/10 border-red-500/30 text-red-700',
    warning: 'bg-orange-500/10 border-orange-500/30 text-orange-700',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md"
    >
      <div className={`
        px-4 py-3 rounded-2xl border backdrop-blur-xl bg-white/80
        flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)]
        ${colors[type]}
      `}>
        {icons[type]}
        <p className="text-sm font-medium">{message}</p>
      </div>
    </motion.div>
  );
};

export default Toast;
