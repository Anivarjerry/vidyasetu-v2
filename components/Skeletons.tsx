
import React from 'react';

// Reusable shimmer block with Dark Mode support
const ShimmerBlock = ({ className = "" }: { className?: string }) => (
  <div className={`bg-gray-100 dark:bg-gray-800 relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite_linear] bg-gradient-to-r from-transparent via-white/50 dark:via-white/5 to-transparent"></div>
  </div>
);

export const SkeletonSchoolCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 transition-colors">
      <div className="flex justify-between items-start">
        <div className="space-y-4 w-3/4">
          <ShimmerBlock className="h-3 w-20 rounded-full" />
          <ShimmerBlock className="h-7 w-3/4 rounded-xl" />
          <ShimmerBlock className="h-4 w-1/2 rounded-lg" />
        </div>
        <ShimmerBlock className="w-12 h-12 rounded-2xl" />
      </div>
    </div>
  );
};

export const SkeletonProfile: React.FC = () => {
  return (
    <div className="p-4 flex flex-col items-center w-full animate-in fade-in duration-700">
      <div className="mt-4 mb-6 relative">
        <ShimmerBlock className="w-28 h-28 rounded-full" />
      </div>

      <div className="flex flex-col items-center space-y-3 mb-8 w-full">
        <ShimmerBlock className="h-8 w-56 rounded-xl" />
        <ShimmerBlock className="h-6 w-28 rounded-full" />
      </div>

      <div className="w-full bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-8 mb-8 transition-colors">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-5">
            <ShimmerBlock className="w-12 h-12 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <ShimmerBlock className="h-3 w-24 rounded-full" />
              <ShimmerBlock className="h-5 w-40 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <ShimmerBlock className="w-full max-w-xs h-14 rounded-2xl" />
    </div>
  );
};

export const SkeletonWidget: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-4 transition-colors">
      <ShimmerBlock className="h-6 w-2/3 rounded-xl" />
      <div className="space-y-3 pt-1">
        <ShimmerBlock className="h-3 w-full rounded-full" />
        <ShimmerBlock className="h-3 w-5/6 rounded-full" />
      </div>
    </div>
  );
};

export const SkeletonPeriodGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm h-48 flex flex-col justify-between transition-colors">
          <div className="flex justify-between">
             <ShimmerBlock className="h-4 w-1/3 rounded-full" />
             <ShimmerBlock className="h-6 w-6 rounded-xl" />
          </div>
          <div className="space-y-3">
            <ShimmerBlock className="h-4 w-full rounded-lg" />
            <ShimmerBlock className="h-3 w-2/3 rounded-lg" />
          </div>
          <ShimmerBlock className="h-10 w-full rounded-xl self-end" />
        </div>
      ))}
    </div>
  );
};
