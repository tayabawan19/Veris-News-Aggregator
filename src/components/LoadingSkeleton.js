'use client';

import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div 
          key={i} 
          className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg animate-pulse h-96 flex flex-col justify-between"
        >
          <div>
            <div className="h-48 bg-slate-800/80 w-full" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-slate-800 rounded-lg w-3/4" />
              <div className="h-4 bg-slate-800 rounded-lg w-1/2" />
              <div className="h-3 bg-slate-800/60 rounded-lg w-full mt-4" />
              <div className="h-3 bg-slate-800/60 rounded-lg w-5/6" />
            </div>
          </div>
          <div className="p-5 border-t border-slate-800/60 flex items-center justify-between gap-2">
            <div className="h-8 bg-slate-800 rounded-xl flex-1" />
            <div className="h-8 bg-slate-800 rounded-xl flex-1" />
            <div className="h-8 bg-slate-800 rounded-xl w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}
