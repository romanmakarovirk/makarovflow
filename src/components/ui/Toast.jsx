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
    success: 'bg-green-500/20 border-green-500 text-green-400',
    error: 'bg-red-500/20 border-red-500 text-red-400',
    warning: 'bg-orange-500/20 border-orange-500 text-orange-400',
    info: 'bg-blue-500/20 border-blue-500 text-blue-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md"
    >
      <div className={`
        px-4 py-3 rounded-xl border-2 backdrop-blur-md
        flex items-center gap-3 shadow-lg
        ${colors[type]}
      `}>
        {icons[type]}
        <p className="text-sm font-medium">{message}</p>
      </div>
    </motion.div>
  );
};

export default Toast;
