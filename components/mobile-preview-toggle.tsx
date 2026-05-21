'use client';

import { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

export function MobilePreviewToggle({ children }: { children: React.ReactNode }) {
  const [isMobileMode, setIsMobileMode] = useState(false);
  
  return (
    <>
      <div 
        className={
          isMobileMode 
            ? "max-w-[375px] mx-auto h-[812px] border-[8px] border-slate-900 rounded-[40px] overflow-hidden shadow-2xl relative mt-8 flex flex-col bg-slate-50" 
            : "h-full w-full min-h-screen flex flex-col"
        }
        style={isMobileMode ? { maxHeight: '100vh' } : {}}
      >
        {children}
      </div>
      
      <button 
        onClick={() => setIsMobileMode(!isMobileMode)}
        className="fixed bottom-4 right-4 z-[9999] bg-slate-900 text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform"
        title="Toggle Mobile Preview"
        aria-label="Toggle Mobile Preview"
      >
        {isMobileMode ? <Monitor className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
      </button>
    </>
  );
}
