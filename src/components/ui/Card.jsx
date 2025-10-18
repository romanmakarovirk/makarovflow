import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  glassmorphism = false,
  ...props
}) => {
  const baseStyles = 'rounded-2xl shadow-lg';

  const cardStyles = glassmorphism
    ? 'bg-white/10 backdrop-blur-md border border-white/20'
    : 'bg-gray-800/50 backdrop-blur-sm';

  const interactiveStyles = hoverable || onClick
    ? 'cursor-pointer hover:scale-[1.02] transition-transform duration-200'
    : '';

  const CardWrapper = onClick ? motion.div : 'div';

  return (
    <CardWrapper
      className={`${baseStyles} ${cardStyles} ${interactiveStyles} ${className}`}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : {}}
      {...props}
    >
      {children}
    </CardWrapper>
  );
};

export default Card;
