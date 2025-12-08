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
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ring-1 ring-white/10';

  const variants = {
    primary: 'bg-gradient-to-r from-[#7c7eff] via-[#6c7bff] to-[#3fc5ff] text-slate-50 hover:shadow-[0_12px_48px_rgba(63,197,255,0.5)]',
    secondary: 'bg-white/10 backdrop-blur-lg text-slate-100 hover:bg-white/15 border border-white/10',
    danger: 'bg-gradient-to-r from-[#ef4444] via-[#f97316] to-[#f59e0b] text-white hover:shadow-[0_12px_40px_rgba(239,68,68,0.35)]',
    ghost: 'bg-transparent text-slate-300 hover:bg-white/5 border border-transparent',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white hover:shadow-[0_12px_40px_rgba(16,185,129,0.35)]'
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
