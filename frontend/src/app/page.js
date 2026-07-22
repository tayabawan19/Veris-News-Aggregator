'use client';

import React, { useState, useEffect, useCallback } from 'react';
import HeroBento from '@/components/HeroBento';
import BentoRow from '@/components/BentoRow';
import StickyFilterBar from '@/components/StickyFilterBar';
import ArticleCard from '@/components/ArticleCard';
import RegionPickerModal from '@/components/RegionPickerModal';
import SkeletonFeed from '@/components/SkeletonFeed';
import { AlertCircle, Newspaper } from 'lucide-react';

const API_BASE_URL = ''; // Relative path for Vercel & local Next.js API routes

export default function Home() {
  const [countries, setCountries] = useState([
    { code: 'pk', name: 'Pakistan' },
    { code: 'in', name: 'India' },
    { code: 'us', name: 'United States' },
    { code: 'gb', name: 'United Kingdom' },
    { code: 'ae', name: 'United Arab Emirates' }
  ]);
  const [selectedCountry, setSelectedCountry] = useState('pk');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [timeframe, setTimeframe] = useState('today');

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regionModalOpen, setRegionModalOpen] = useState(false);

  // Fetch Countries on Mount
  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/news/countries`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCountries(data);
          }
        }
      } catch (err) {
        console.warn('Using default countries list.');
      }
    }
    fetchCountries();
  }, []);

  // Fetch News Articles with graceful error handling
  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        country: selectedCountry,
        timeframe: timeframe
      });
      if (city.trim()) params.append('city', city.trim());
      if (category) params.append('category', category);

      const requestUrl = `${API_BASE_URL}/api/news?${params.toString()}`;
      console.log(`[Frontend GET /api/news] Request URL: ${requestUrl}`);

      const res = await fetch(requestUrl);
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setArticles(data);
        if (data.length === 0) {
          setError(null);
        }
      } else {
        const message = (data && data.error) ? data.error : 'Temporarily unable to fetch fresh data for this filter.';
        console.warn('API Warning:', message);
        setError(message);
        setArticles([]);
      }
    } catch (err) {
      console.warn('Network / API Exception:', err.message);
      setError('Unable to reach news server. Please check connection.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, city, category, timeframe]);

  // Initial Fetch & Auto Fetch on Filter change
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Quick Region selection from Bento Row
  const handleSelectQuickRegion = (countryCode, cityName) => {
    setSelectedCountry(countryCode);
    setCity(cityName);
    const element = document.getElementById('articles-feed');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const selectedCountryObj = countries.find((c) => c.code === selectedCountry);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] font-sans selection:bg-[#2456C9] selection:text-white pb-16">
      
      {/* 1. Bento-Style Hero Header & Wire Ticker */}
      <HeroBento
        countries={countries}
        selectedCountry={selectedCountry}
        onSelectCountry={setSelectedCountry}
        city={city}
        onCityChange={setCity}
        onSearch={fetchNews}
        onOpenRegionPicker={() => setRegionModalOpen(true)}
        latestArticles={articles}
        selectedCategory={category}
        onSelectCategory={setCategory}
      />

      {/* 2. 3-Card Bento Row Below Hero */}
      <BentoRow onSelectQuickRegion={handleSelectQuickRegion} />

      {/* 3. Sticky Editorial Magazine Filter Bar */}
      <StickyFilterBar
        selectedCountryObj={selectedCountryObj}
        city={city}
        onOpenRegionPicker={() => setRegionModalOpen(true)}
        category={category}
        onSelectCategory={setCategory}
        timeframe={timeframe}
        onSelectTimeframe={setTimeframe}
        onRefresh={fetchNews}
        loading={loading}
      />

      {/* 4. Main Article Feed Section */}
      <main id="articles-feed" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-20">
        
        {/* Section Header */}
        <div className="flex items-center justify-between my-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono-meta uppercase tracking-wider text-[#2456C9] font-bold mb-1">
              <span>{category ? `CATEGORY: ${category.toUpperCase()}` : 'ALL DISPATCHES'}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
              Latest Regional Dispatches
            </h2>
            <p className="text-xs text-[#6B6B66] font-mono-meta mt-1">
              Showing news for {selectedCountryObj?.name || 'Selected Region'} {city ? `(${city})` : ''} • {timeframe === 'today' ? 'Published Today' : 'Published This Week'}
            </p>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono-meta text-[#6B6B66]">
            <span>Feed status:</span>
            {loading ? (
              <span className="text-[#2456C9] font-bold animate-pulse">● Fetching Category...</span>
            ) : (
              <span className="text-emerald-600 font-bold">● Active</span>
            )}
          </div>
        </div>

        {/* User-Friendly Error State Banner */}
        {error && (
          <div className="my-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-xs uppercase font-mono-meta">Feed Notice</h3>
              <p className="text-xs text-amber-800 mt-0.5">{error}</p>
            </div>
            <button
              onClick={fetchNews}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-all cursor-pointer shadow-sm"
            >
              Refresh Feed
            </button>
          </div>
        )}

        {/* Loading / Article Grid / Category-Specific Empty State */}
        {loading ? (
          <SkeletonFeed />
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, idx) => (
              <ArticleCard
                key={article.url || article.title || idx}
                article={article}
                apiBaseUrl={API_BASE_URL}
              />
            ))}
          </div>
        ) : !error ? (
          <div className="bg-white rounded-3xl border border-[#E5E4DE] p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#FAFAF8] border border-[#E5E4DE] flex items-center justify-center mx-auto mb-4 text-[#6B6B66]">
              <Newspaper className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">No Dispatches Found</h3>
            <p className="text-xs text-[#6B6B66] mt-2 leading-relaxed font-normal">
              No articles found in <strong className="text-[#1A1A1A]">{category ? category.toUpperCase() : 'this category'}</strong> for {selectedCountryObj?.name || 'this region'}. Try switching to another category or resetting filters.
            </p>
            <button
              onClick={() => {
                setCity('');
                setCategory('');
                setTimeframe('today');
              }}
              className="mt-5 text-xs font-semibold px-5 py-2.5 rounded-full bg-[#1A1A1A] text-white hover:bg-[#2456C9] transition-all shadow-md cursor-pointer"
            >
              Show All Categories
            </button>
          </div>
        ) : null}
      </main>

      {/* Region Picker Modal */}
      <RegionPickerModal
        isOpen={regionModalOpen}
        onClose={() => setRegionModalOpen(false)}
        countries={countries}
        selectedCountry={selectedCountry}
        onSelectCountry={setSelectedCountry}
        city={city}
        onCityChange={setCity}
        onApply={fetchNews}
      />

      {/* Footer */}
      <footer className="border-t border-[#E5E4DE] max-w-7xl mx-auto mx-4 sm:mx-6 pt-8 mt-16 text-center text-xs text-[#6B6B66] font-mono-meta flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>Veris © 2026 • AI-Powered Regional Newsroom System</div>
        <div className="flex items-center space-x-4">
          <span>Next.js 16 App Router</span>
          <span>•</span>
          <span>Supabase Postgres</span>
          <span>•</span>
          <span>Gemini 2.5 Flash</span>
        </div>
      </footer>
    </div>
  );
}
