'use client';

import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'capsule';
}

export function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const borderRadius = variant === 'circle' ? 'rounded-full' : variant === 'capsule' ? 'rounded-[20px]' : 'rounded-2xl';

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${borderRadius} ${className}`}>
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />
    </div>
  );
}
