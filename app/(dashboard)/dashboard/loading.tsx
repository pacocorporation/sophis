'use client';

import { motion } from 'motion/react';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap } from 'lucide-react';

export default function DashboardLoading() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Header Loading */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </motion.div>

      {/* Hero Stats Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <motion.div 
            key={i} 
            variants={item}
            className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
            <Skeleton className="h-4 w-24" />
            <div className="flex items-end justify-between">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-5 w-12 rounded-lg" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Chart Loading */}
          <motion.div variants={item} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-80 w-full rounded-2xl" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Team Grid Loading */}
            <motion.div variants={item} className="bg-white p-6 rounded-[28px] border border-slate-100 space-y-4">
               <Skeleton className="h-6 w-40" />
               <div className="space-y-4 pt-2">
                 {[...Array(3)].map((_, i) => (
                   <div key={i} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                     </div>
                     <Skeleton className="h-6 w-12" />
                   </div>
                 ))}
               </div>
            </motion.div>

            {/* AI Report Card Loading */}
            <motion.div variants={item} className="bg-slate-900 p-6 rounded-[28px] space-y-6">
              <Skeleton className="w-10 h-10 rounded-xl bg-slate-800" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40 bg-slate-800" />
                <Skeleton className="h-4 w-full bg-slate-800" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl bg-brand-blue/30" />
            </motion.div>
          </div>
        </div>

        {/* Sidebar Loading */}
        <div className="space-y-8">
           <motion.div variants={item} className="bg-white p-6 rounded-[28px] border border-slate-100 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
           </motion.div>

           <motion.div variants={item} className="bg-white p-6 rounded-[28px] border border-slate-100 space-y-6">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
           </motion.div>
        </div>
      </div>

      {/* Personalized Center Pulse */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center -z-10 opacity-20">
        <motion.div
           animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
           }}
           transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
           }}
        >
          <Zap className="w-64 h-64 text-brand-blue" />
        </motion.div>
      </div>
    </motion.div>
  );
}
