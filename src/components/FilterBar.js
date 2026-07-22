'use client';

import React from 'react';
import { Search, MapPin, Calendar, Tag, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  { id: '', label: 'All News' },
  { id: 'top', label: 'Top Headlines' },
  { id: 'business', label: 'Business' },
  { id: 'sports', label: 'Sports' },
  { id: 'technology', label: 'Technology' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'health', label: 'Health' }
];

export default function FilterBar({
  countries,
  selectedCountry,
  onSelectCountry,
  city,
  onCityChange,
  category,
  onSelectCategory,
  timeframe,
  onSelectTimeframe,
  onSearch,
  loading
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md mb-8">
      {/* Top Row: Country, City Input, Timeframe, Search Button */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Country Selector */}
        <div className="md:col-span-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            Country Region
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => onSelectCountry(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code} className="bg-slate-900 text-slate-100">
                {c.name} ({c.code.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* City Refinement Input */}
        <div className="md:col-span-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-teal-400" />
            City Keyword (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Lahore, Karachi, London..."
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-sm rounded-xl pl-3.5 pr-9 py-2.5 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
            />
            {city && (
              <button
                onClick={() => onCityChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Timeframe Toggle */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            Time Range
          </label>
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => onSelectTimeframe('today')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeframe === 'today'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => onSelectTimeframe('week')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeframe === 'week'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        {/* Fetch / Refresh Button */}
        <div className="md:col-span-2 flex items-end">
          <button
            onClick={onSearch}
            disabled={loading}
            className="w-full mt-5 md:mt-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Fetching...' : 'Get News'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Category Chips */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1 shrink-0 mr-1">
            <Tag className="w-3 h-3 text-slate-400" />
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 border ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
