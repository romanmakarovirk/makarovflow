import { motion } from 'framer-motion';
import { haptic } from '../../utils/telegram';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-gradient-to-b from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-[0_4px_12px_rgba(0,122,255,0.3)]',
    secondary: 'bg-white/80 backdrop-blur-md text-gray-900 hover:bg-white border border-black/10 shadow-sm',
    danger: 'bg-gradient-to-b from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-[0_4px_12px_rgba(239,68,68,0.3)]',
    ghost: 'bg-transparent text-gray-700 hover:bg-black/5',
    success: 'bg-gradient-to-b from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-[0_4px_12px_rgba(34,197,94,0.3)]'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const handleClick = (e) => {
    if (!disabled) {
      haptic.medium();
      onClick?.(e);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
