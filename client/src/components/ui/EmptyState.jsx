import React from 'react';

export const EmptyState = ({ icon: Icon, title, message, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-card backdrop-blur-md rounded-3xl border border-border/50 shadow-inner min-h-75">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        {Icon ? <Icon size={32} className="text-primary opacity-80" /> : <span className="text-3xl">👻</span>}
      </div>
      <h3 className="text-xl font-bold text-text mb-2">{title || 'Nothing here yet'}</h3>
      <p className="text-muted text-sm max-w-sm mb-6 leading-relaxed">
        {message || "There doesn't seem to be anything in this section right now. Check back later or create something new."}
      </p>
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="px-6 py-2 rounded-xl bg-surface-soft border border-border text-text font-semibold hover:bg-white/10 hover:border-primary/50 transition-all text-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
