import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, hover = true }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.3, ease: "easeOut" } } : {}}
      className={cn(
        "bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl p-6 overflow-hidden relative shadow-2xl",
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
