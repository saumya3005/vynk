import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${maxWidth} z-50`}
          >
            <div className="bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {title && (
                <div className="flex items-center justify-between p-4 border-b border-border bg-surface-soft/50">
                  <h3 className="font-bold text-lg text-text">{title}</h3>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-muted hover:text-text transition-colors">
                    <X size={20} />
                  </button>
                </div>
              )}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
