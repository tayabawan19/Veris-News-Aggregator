'use client';

import React from 'react';
import { Radio, Sparkles, Globe, Zap, Languages, Calendar, Filter } from 'lucide-react';

export default function BentoRow({ onSelectQuickRegion }) {
  const POPULAR_REGIONS = [
    { name: 'Lahore', code: 'pk', city: 'Lahore' },
    { name: 'Karachi', code: 'pk', city: 'Karachi' },
    { name: 'New York', code: 'us', city: 'New York' },
    { name: 'London', code: 'gb', city: 'London' },
    { name: 'Dubai', code: 'ae', city: 'Dubai' },
    { name: 'New Delhi', code: 'in', city: 'New Delhi' }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Card 1: Dark Stat Card */}
      <div className="bg-[#1A1A1A] text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="font-mono-meta text-[11px] uppercase tracking-widest text-slate-400">
            REGIONAL COVERAGE
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#D6402C]/20 border border-[#D6402C]/40 text-[#D6402C] text-[10px] font-bold font-mono-meta flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D6402C] animate-pulse"></span>
            LIVE NOW
          </span>
        </div>

        <div className="my-6">
          <div className="font-serif text-5xl font-extrabold tracking-tight text-white mb-2">
            12 Regions
          </div>
          <p className="text-slate-400 text-xs leading-relaxed font-normal">
            Directly monitoring primary wire services, local newspapers, and independent press across South Asia, Middle East, Europe & Americas.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono-meta">
          <span>Cached: 45 Minutes</span>
          <span className="text-emerald-400 font-bold">● 100% Verified</span>
        </div>
      </div>

      {/* Card 2: Editorial Blue Gradient Card (Popular Regions) */}
      <div className="bg-gradient-to-br from-[#2456C9] to-[#163ca8] text-white rounded-3xl p-6 border border-[#2456C9]/40 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 text-blue-200 text-xs font-mono-meta mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>QUICK ACCESS</span>
          </div>
          <h3 className="font-serif text-2xl font-bold tracking-tight mb-2">
            Popular City Feeds
          </h3>
          <p className="text-blue-100/80 text-xs leading-relaxed mb-4">
            Click any city below to filter live breaking news specifically for that metropolitan area.
          </p>
        </div>

        {/* Quick Click City Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {POPULAR_REGIONS.map((reg) => (
            <button
              key={reg.name}
              onClick={() => onSelectQuickRegion(reg.code, reg.city)}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <span>{reg.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Card 3: Light AI Preview & 2x2 Feature Grid */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E4DE] shadow-xl flex flex-col justify-between">
        
        {/* Left Side: Sample AI Bubble */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#2456C9]">
              <Sparkles className="w-4 h-4 text-[#2456C9]" />
              AI Intelligence Layer
            </span>
            <span className="text-[10px] font-mono-meta px-2 py-0.5 rounded bg-blue-50 text-[#2456C9] font-bold">
              GEMINI 2.5 FLASH
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F0F4FF] border border-[#2456C9]/20 text-xs text-[#1A1A1A] leading-relaxed mb-4">
            <span className="font-bold text-[#2456C9] block mb-1">⚡ 2-Sentence Executive Summary:</span>
            "The Asian Development Bank and Japan established a $10M fund to strengthen regional water security against floods and droughts."
          </div>
        </div>

        {/* Right Side: 2x2 Mini-Feature Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E4DE]">
          <div className="flex items-center space-x-2 text-[11px] font-medium text-[#1A1A1A] p-2 rounded-xl bg-[#FAFAF8]">
            <Sparkles className="w-3.5 h-3.5 text-[#2456C9]" />
            <span>AI Summarize</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-medium text-[#1A1A1A] p-2 rounded-xl bg-[#FAFAF8]">
            <Languages className="w-3.5 h-3.5 text-[#2456C9]" />
            <span>Multi-Translate</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-medium text-[#1A1A1A] p-2 rounded-xl bg-[#FAFAF8]">
            <Calendar className="w-3.5 h-3.5 text-[#2456C9]" />
            <span>Today / Week</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-medium text-[#1A1A1A] p-2 rounded-xl bg-[#FAFAF8]">
            <Filter className="w-3.5 h-3.5 text-[#2456C9]" />
            <span>Category Filter</span>
          </div>
        </div>
      </div>

    </section>
  );
}
