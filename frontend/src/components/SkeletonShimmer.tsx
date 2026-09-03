'use client';

import React from 'react';

interface SkeletonShimmerProps {
  className?: string;
}

export const SkeletonShimmer: React.FC<SkeletonShimmerProps> = ({ className = 'h-6 w-full' }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-dark-800 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-slate-600/20 to-transparent" />
    </div>
  );
};
