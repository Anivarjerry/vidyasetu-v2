import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3 animate-in fade-in duration-500 transition-colors">
      {/* Title Line */}
      <div className="h-5 w-3/4 rounded-md shimmer-effect"></div>
      
      {/* Subtitle Lines */}
      <div className="space-y-2 pt-1">
        <div className="h-3 w-full rounded-md shimmer-effect"></div>
        <div className="h-3 w-5/6 rounded-md shimmer-effect"></div>
      </div>
      
      {/* Footer/Action area fake */}
      <div className="flex gap-2 pt-2">
         <div className="h-8 w-24 rounded-lg shimmer-effect"></div>
      </div>
    </div>
  );
};