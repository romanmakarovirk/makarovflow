import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  glassmorphism = true, // Default to Liquid Glass
  ...props
}) => {
  const baseStyles = 'rounded-3xl';

  // Apple-style Frosted Glass effect
  const cardStyles = glassmorphism
    ? 'bg-white/70 backdrop-blur-xl backdrop-saturate-180 border border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
    : 'bg-white/50 backdrop-blur-sm border border-black/5 shadow-sm';

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
      <div className="relative z-10">
        {children}
      </div>
    </CardWrapper>
  );
};

export default Card;
