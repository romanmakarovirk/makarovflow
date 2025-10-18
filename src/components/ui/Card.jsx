import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  glassmorphism = true, // Default to Liquid Glass
  ...props
}) => {
  const baseStyles = 'rounded-3xl shadow-2xl';

  // Liquid Glass effect (iOS 18 style)
  const cardStyles = glassmorphism
    ? 'bg-gradient-to-br from-gray-800/70 via-gray-800/60 to-gray-900/70 backdrop-blur-2xl backdrop-saturate-150 border border-white/10'
    : 'bg-gray-800/50 backdrop-blur-sm border border-gray-700';

  const interactiveStyles = hoverable || onClick
    ? 'cursor-pointer hover:scale-[1.01] hover:shadow-3xl active:scale-[0.99] transition-all duration-300 ease-out'
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
