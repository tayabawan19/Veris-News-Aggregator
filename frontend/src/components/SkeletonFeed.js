'use client';

import React from 'react';

export default function SkeletonFeed() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white rounded-3xl border border-[#E5E4DE] overflow-hidden shadow-sm animate-pulse h-96 flex flex-col justify-between"
        >
          <div>
            <div className="h-48 bg-[#FAFAF8] w-full" />
            <div className="p-6 space-y-3">
              <div className="h-5 bg-[#E5E4DE] rounded-lg w-5/6" />
              <div className="h-4 bg-[#E5E4DE] rounded-lg w-2/3" />
              <div className="h-3 bg-[#FAFAF8] rounded-lg w-full mt-4" />
              <div className="h-3 bg-[#FAFAF8] rounded-lg w-4/5" />
            </div>
          </div>
          <div className="p-4 border-t border-[#E5E4DE] flex items-center justify-between gap-2">
            <div className="h-8 bg-[#FAFAF8] rounded-full flex-1" />
            <div className="h-8 bg-[#FAFAF8] rounded-full flex-1" />
            <div className="h-8 bg-[#FAFAF8] rounded-full w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}
