'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, MapPin, Check, Globe } from 'lucide-react';

const QUICK_CITIES_MAP = {
  pk: ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Faisalabad'],
  in: ['New Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai'],
  us: ['New York', 'Washington', 'Los Angeles', 'Chicago', 'San Francisco'],
  gb: ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
  ae: ['Dubai', 'Abu Dhabi', 'Sharjah']
};

export default function RegionPickerModal({
  isOpen,
  onClose,
  countries,
  selectedCountry,
  onSelectCountry,
  city,
  onCityChange,
  onApply
}) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quickCities = QUICK_CITIES_MAP[selectedCountry] || [];

  const handleApply = () => {
    onApply();
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-3xl border border-[#E5E4DE] max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E5E4DE] flex items-center justify-between bg-[#FAFAF8]">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-[#2456C9]/10 border border-[#2456C9]/20 text-[#2456C9]">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
                  Select Region & City
                </h3>
                <p className="text-xs text-[#6B6B66]">
                  Filter live news feeds by nation and metropolitan city.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white border border-[#E5E4DE] text-[#6B6B66] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-4 border-b border-[#E5E4DE] bg-[#FAFAF8]/50">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6B6B66] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search country name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E5E4DE] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#1A1A1A] placeholder-[#6B6B66] focus:outline-none focus:border-[#2456C9] transition-all"
              />
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[350px]">
            
            {/* Country Selection */}
            <div>
              <label className="block text-xs font-mono-meta uppercase tracking-wider text-[#6B6B66] mb-2.5 font-bold">
                1. Select Country
              </label>
              <div className="grid grid-cols-2 gap-2">
                {filteredCountries.map((c) => {
                  const isSelected = selectedCountry === c.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => onSelectCountry(c.code)}
                      className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#2456C9] text-white border-[#2456C9] shadow-md'
                          : 'bg-[#FAFAF8] text-[#1A1A1A] border-[#E5E4DE] hover:border-[#2456C9]'
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      <span className="font-mono-meta text-[10px] uppercase opacity-80">{c.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City Refinement Input */}
            <div>
              <label className="block text-xs font-mono-meta uppercase tracking-wider text-[#6B6B66] mb-2 font-bold">
                2. City Keyword (Optional)
              </label>
              <div className="relative mb-3">
                <MapPin className="w-4 h-4 text-[#2456C9] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter specific city (e.g. Lahore)..."
                  value={city}
                  onChange={(e) => onCityChange(e.target.value)}
                  className="w-full bg-[#FAFAF8] border border-[#E5E4DE] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#1A1A1A] placeholder-[#6B6B66] focus:outline-none focus:border-[#2456C9] transition-all"
                />
              </div>

              {/* Quick City Chips */}
              {quickCities.length > 0 && (
                <div>
                  <span className="text-[11px] text-[#6B6B66] block mb-1.5 font-medium">Quick Select Cities:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickCities.map((cityName) => (
                      <button
                        key={cityName}
                        onClick={() => onCityChange(cityName)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                          city.toLowerCase() === cityName.toLowerCase()
                            ? 'bg-[#2456C9] text-white border-[#2456C9]'
                            : 'bg-white text-[#6B6B66] border-[#E5E4DE] hover:text-[#1A1A1A]'
                        }`}
                      >
                        {cityName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#E5E4DE] bg-[#FAFAF8] flex items-center justify-between">
            <button
              onClick={() => {
                onCityChange('');
                onSelectCountry('pk');
              }}
              className="text-xs text-[#6B6B66] hover:text-[#1A1A1A] underline font-mono-meta"
            >
              Reset Region
            </button>

            <button
              onClick={handleApply}
              className="bg-[#1A1A1A] hover:bg-[#2456C9] text-white text-xs font-semibold py-2.5 px-6 rounded-full shadow-md transition-all active:scale-95"
            >
              Apply Filter
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
