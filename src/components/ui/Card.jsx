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

  // Midnight glass morphism effect
  const cardStyles = glassmorphism
    ? 'bg-gradient-to-br from-[#101727]/85 via-[#0c1220]/85 to-[#0a101d]/90 border border-white/5 shadow-[0_12px_48px_rgba(0,0,0,0.45)] ring-1 ring-white/5 backdrop-blur-2xl'
    : 'bg-[#0e1526]/85 border border-white/5 shadow-[0_10px_36px_rgba(0,0,0,0.35)] backdrop-blur-xl';

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
      <div className="pointer-events-none absolute inset-px rounded-[22px] opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(124,126,255,0.25),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(63,197,255,0.18),transparent_35%)]" />
      <div className="relative z-10">
        {children}
      </div>
    </CardWrapper>
  );
};

export default Card;
