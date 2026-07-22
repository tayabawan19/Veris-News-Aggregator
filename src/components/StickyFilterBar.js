'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  { id: '', label: 'All Stories' },
  { id: 'top', label: 'Top Headlines' },
  { id: 'business', label: 'Business' },
  { id: 'technology', label: 'Technology' },
  { id: 'sports', label: 'Sports' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'health', label: 'Health' }
];

export default function StickyFilterBar({
  selectedCountryObj,
  city,
  onOpenRegionPicker,
  category,
  onSelectCategory,
  timeframe,
  onSelectTimeframe,
  onRefresh,
  loading
}) {
  const handleCategoryClick = (catId) => {
    onSelectCategory(catId);
    const element = document.getElementById('articles-feed');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-0 z-30 w-full bg-[#FAFAF8]/95 backdrop-blur-md border-y border-[#E5E4DE] shadow-sm my-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Region Display Pill */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenRegionPicker}
            className="flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-full border border-[#E5E4DE] text-xs font-semibold text-[#1A1A1A] hover:border-[#2456C9] transition-all shadow-sm cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-[#2456C9]" />
            <span>Region: <strong>{selectedCountryObj?.name || 'Pakistan'}</strong></span>
            {city && <span className="text-[#2456C9]">({city})</span>}
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-full bg-white border border-[#E5E4DE] text-[#6B6B66] hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2456C9]' : ''}`} />
          </button>
        </div>

        {/* Center: Underline-Style Magazine Category Tabs */}
        <div className="flex items-center space-x-6 overflow-x-auto scrollbar-none py-1">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`relative py-1 text-xs font-semibold tracking-tight transition-colors shrink-0 cursor-pointer ${
                  isActive ? 'text-[#2456C9]' : 'text-[#6B6B66] hover:text-[#1A1A1A]'
                }`}
              >
                <span>{cat.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="category-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2456C9] rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Today / This Week Segmented Control */}
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-full border border-[#E5E4DE] shadow-sm self-start md:self-auto">
          <Calendar className="w-3.5 h-3.5 text-[#6B6B66] ml-2" />
          <button
            onClick={() => onSelectTimeframe('today')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              timeframe === 'today'
                ? 'bg-[#1A1A1A] text-white shadow-sm'
                : 'text-[#6B6B66] hover:text-[#1A1A1A]'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => onSelectTimeframe('week')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              timeframe === 'week'
                ? 'bg-[#1A1A1A] text-white shadow-sm'
                : 'text-[#6B6B66] hover:text-[#1A1A1A]'
            }`}
          >
            This Week
          </button>
        </div>
      </div>
    </div>
  );
}
