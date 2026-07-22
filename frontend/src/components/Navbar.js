'use client';

import React from 'react';
import { Globe } from 'lucide-react';

export default function Navbar({ onOpenRegionPicker, selectedCountryObj, selectedCategory, onSelectCategory }) {
  const CATEGORIES = [
    { id: '', label: 'All Stories' },
    { id: 'top', label: 'Top Headlines' },
    { id: 'business', label: 'Business' },
    { id: 'technology', label: 'Technology' },
    { id: 'sports', label: 'Sports' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'health', label: 'Health' }
  ];

  const handleCategoryClick = (catId) => {
    onSelectCategory(catId);
    const element = document.getElementById('articles-feed');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="w-full py-4 px-6 sm:px-8 border-b border-[#E5E4DE]/60 flex items-center justify-between">
      {/* Brand Masthead Logo */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-[#1A1A1A]">
            VERIS
          </span>
          {/* Wire-Red LIVE Pulse Indicator */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#D6402C]/10 border border-[#D6402C]/30 text-[#D6402C] text-[10px] font-bold font-mono-meta tracking-wider uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D6402C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D6402C]"></span>
            </span>
            <span>LIVE WIRE</span>
          </div>
        </div>
      </div>

      {/* Center Nav Links (Desktop & Tablet) */}
      <div className="hidden md:flex items-center space-x-5 text-xs font-semibold text-[#6B6B66]">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`transition-colors py-1 cursor-pointer ${
              selectedCategory === cat.id
                ? 'text-[#2456C9] font-bold border-b-2 border-[#2456C9]'
                : 'hover:text-[#1A1A1A]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Right Side: Select Region Pill Button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenRegionPicker}
          className="group flex items-center space-x-2 bg-[#2456C9] hover:bg-[#1d46a8] text-white text-xs font-semibold py-2.5 px-4 rounded-full shadow-md shadow-[#2456C9]/20 transition-all active:scale-95 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-blue-200 group-hover:rotate-45 transition-transform" />
          <span>Region: <strong>{selectedCountryObj?.name || 'Global'}</strong></span>
        </button>
      </div>
    </nav>
  );
}
