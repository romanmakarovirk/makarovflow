import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  glassmorphism = true, // Default to Liquid Glass
  ...props
}) => {
  const baseStyles = 'rounded-3xl relative overflow-hidden';

  // Midnight glass morphism effect - более светлый
  const cardStyles = glassmorphism
    ? 'bg-gradient-to-br from-[#1a1f2e]/80 via-[#161b28]/80 to-[#141922]/85 border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] ring-1 ring-white/8 backdrop-blur-2xl'
    : 'bg-[#161b28]/80 border border-white/8 shadow-[0_6px_24px_rgba(0,0,0,0.25)] backdrop-blur-xl';

  const interactiveStyles = hoverable || onClick
    ? 'cursor-pointer hover:scale-[1.02] hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] active:scale-[0.98] transition-all duration-300 ease-out'
    : '';

  const CardWrapper = onClick ? motion.div : 'div';

  return (
    <CardWrapper
      className={`${baseStyles} ${cardStyles} ${interactiveStyles} ${className}`}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.97 } : {}}
      {...props}
    >
      <div className="pointer-events-none absolute inset-px rounded-[22px] opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(124,126,255,0.15),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(63,197,255,0.12),transparent_40%)]" />
      <div className="relative z-10">
        {children}
      </div>
    </CardWrapper>
  );
};

export default Card;
