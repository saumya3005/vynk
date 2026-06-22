import React from 'react';
import { motion } from 'framer-motion';

export const Switch = ({ checked, onChange }) => {
  return (
    <div 
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
        checked ? 'bg-primary' : 'bg-surface-soft border border-border'
      }`}
      onClick={() => onChange(!checked)}
    >
      <motion.div
        className="bg-white w-4 h-4 rounded-full shadow-md"
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        initial={false}
        animate={{ x: checked ? 24 : 0 }}
      />
    </div>
  );
};
