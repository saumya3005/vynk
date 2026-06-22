import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5',
    secondary: 'bg-surface-soft text-text border border-border hover:bg-surface hover:border-border-premium',
    ghost: 'text-muted hover:text-text hover:bg-surface-soft',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg',
    md: 'text-sm px-5 py-2.5 rounded-xl',
    lg: 'text-base px-6 py-3 rounded-2xl'
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.97 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </motion.button>
  );
};
