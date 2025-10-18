import { motion } from 'framer-motion';
import { haptic } from '../../utils/telegram';
import { Check } from 'lucide-react';

const Tag = ({
  children,
  selected = false,
  onClick,
  variant = 'default',
  className = ''
}) => {
  const variants = {
    default: selected
      ? 'bg-blue-500/20 border-blue-500 text-blue-400'
      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600',
    success: selected
      ? 'bg-green-500/20 border-green-500 text-green-400'
      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600',
    warning: selected
      ? 'bg-orange-500/20 border-orange-500 text-orange-400'
      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
  };

  const handleClick = () => {
    haptic.light();
    onClick?.();
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`
        px-3 py-2 rounded-lg border-2 text-sm font-medium
        transition-all duration-200 flex items-center gap-2
        ${variants[variant]}
        ${className}
      `}
    >
      {selected && <Check size={16} />}
      {children}
    </motion.button>
  );
};

export default Tag;
