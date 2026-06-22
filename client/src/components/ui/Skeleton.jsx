import React from 'react';

export const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = 'bg-border/30 animate-pulse';
  let variantClasses = '';

  switch (variant) {
    case 'circular':
      variantClasses = 'rounded-full';
      break;
    case 'text':
      variantClasses = 'h-4 rounded-md w-full';
      break;
    case 'rectangular':
    default:
      variantClasses = 'rounded-2xl';
      break;
  }

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`} />
  );
};

export const PostSkeleton = () => (
  <div className="bg-card backdrop-blur-md rounded-2xl border border-border p-4 w-full">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton variant="circular" className="w-10 h-10 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-1/3 h-3" />
        <Skeleton variant="text" className="w-1/4 h-2 opacity-50" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <Skeleton variant="text" className="w-full h-3" />
      <Skeleton variant="text" className="w-5/6 h-3" />
      <Skeleton variant="text" className="w-4/6 h-3" />
    </div>
    <Skeleton variant="rectangular" className="w-full h-48 mb-4" />
    <div className="flex gap-4">
      <Skeleton variant="rectangular" className="w-12 h-6" />
      <Skeleton variant="rectangular" className="w-12 h-6" />
      <Skeleton variant="rectangular" className="w-12 h-6" />
    </div>
  </div>
);
