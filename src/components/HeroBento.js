'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Search, MapPin, Zap, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import Navbar from './Navbar';

export default function HeroBento({
  countries,
  selectedCountry,
  onSelectCountry,
  city,
  onCityChange,
  onSearch,
  onOpenRegionPicker,
  latestArticles = [],
  selectedCategory,
  onSelectCategory
}) {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const tickerRef = useRef(null);
  const svgLine1Ref = useRef(null);
  const svgLine2Ref = useRef(null);
  const svgLine3Ref = useRef(null);

  // GSAP Entrance Animations
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      headlineRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 }
    );

    tl.fromTo(
      tickerRef.current,
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7 },
      '-=0.4'
    );

    tl.fromTo(
      '.floating-stat-card',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.15 },
      '-=0.3'
    );

    const lines = [svgLine1Ref.current, svgLine2Ref.current, svgLine3Ref.current];
    lines.forEach((line) => {
      if (line) {
        const length = line.getTotalLength ? line.getTotalLength() : 200;
        gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
        tl.to(line, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }, '-=0.6');
      }
    });
  }, { scope: containerRef });

  const selectedCountryObj = countries.find((c) => c.code === selectedCountry);

  const handleCategoryClick = (catId) => {
    onSelectCategory(catId);
    const element = document.getElementById('articles-feed');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetNewsSubmit = () => {
    onSearch();
    const element = document.getElementById('articles-feed');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const wireHeadlines = latestArticles.length > 0 ? latestArticles.slice(0, 5) : [
    { title: 'Asian Development Bank & Japan establish new $10M water security fund', time: '10m ago' },
    { title: 'Petrol pump dealers announce nationwide strike following federal talks', time: '25m ago' },
    { title: 'Central Bank signals key interest rate adjustment ahead of fiscal review', time: '40m ago' },
    { title: 'Tech consortium reveals breakthrough in low-latency regional connectivity', time: '1h ago' }
  ];

  return (
    <section ref={containerRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Outer Bento Frame */}
      <div className="bg-gradient-to-b from-[#FAFAF8] via-[#F4F6FC] to-[#EBF0FA] rounded-[28px] border border-[#E5E4DE] shadow-xl shadow-slate-200/50 overflow-hidden relative">
        
        {/* Masthead Navbar */}
        <Navbar
          onOpenRegionPicker={onOpenRegionPicker}
          selectedCountryObj={selectedCountryObj}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />

        {/* Hero Main Grid */}
        <div className="p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* Left Column: Value Proposition & Combined Input */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#2456C9]/10 border border-[#2456C9]/20 text-[#2456C9] text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-[#2456C9]" />
              <span>Veris AI Newsroom</span>
            </div>

            {/* Serif Headline */}
            <div ref={headlineRef}>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-[#1A1A1A] leading-[1.1] tracking-tight">
                Your City. <br />
                <span className="italic font-normal text-[#2456C9]">This Week.</span> <br />
                No Noise.
              </h1>
              <p className="text-[#6B6B66] text-base sm:text-lg mt-4 max-w-xl font-normal leading-relaxed">
                Filter verified news from <strong className="text-[#1A1A1A] font-semibold">{selectedCountryObj?.name || 'your region'}</strong> with AI-powered summaries & instant translations on demand.
              </p>
            </div>

            {/* Combined Pill Selector (Country + City + Action Button) */}
            <div className="bg-white p-2 rounded-full border border-[#E5E4DE] shadow-lg shadow-slate-200/80 flex flex-col sm:flex-row items-center gap-2 max-w-2xl">
              
              {/* Country Dropdown */}
              <div className="flex items-center space-x-2 px-4 py-2 flex-1 w-full border-b sm:border-b-0 sm:border-r border-[#E5E4DE]">
                <MapPin className="w-4 h-4 text-[#2456C9] shrink-0" />
                <select
                  value={selectedCountry}
                  onChange={(e) => onSelectCountry(e.target.value)}
                  className="bg-transparent text-[#1A1A1A] text-sm font-semibold focus:outline-none w-full cursor-pointer"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* City Input */}
              <div className="flex items-center space-x-2 px-4 py-2 flex-1 w-full">
                <Search className="w-4 h-4 text-[#6B6B66] shrink-0" />
                <input
                  type="text"
                  placeholder="City keyword (e.g. Lahore, London)..."
                  value={city}
                  onChange={(e) => onCityChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGetNewsSubmit()}
                  className="bg-transparent text-[#1A1A1A] text-sm font-normal placeholder-[#6B6B66] focus:outline-none w-full"
                />
              </div>

              {/* Get My News Button */}
              <button
                onClick={handleGetNewsSubmit}
                className="w-full sm:w-auto bg-[#1A1A1A] hover:bg-[#2456C9] text-white font-semibold text-sm py-3 px-6 rounded-full shadow-md transition-all duration-300 flex items-center justify-center space-x-2 shrink-0 active:scale-95 cursor-pointer"
              >
                <span>Get My News</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Helper Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B6B66] pt-1">
              <span className="flex items-center gap-1.5 font-mono-meta">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Zero Hallucinations Guarantee
              </span>
              <span className="flex items-center gap-1.5 font-mono-meta">
                <Clock className="w-3.5 h-3.5 text-[#2456C9]" />
                Cached Every 45 Mins
              </span>
            </div>
          </div>

          {/* Right Column: Wire Ticker Terminal & Floating Stat Cards */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* SVG Connector Lines Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden sm:block" viewBox="0 0 500 400">
              <path
                ref={svgLine1Ref}
                d="M 50 60 L 150 120"
                fill="none"
                stroke="#2456C9"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="opacity-40"
              />
              <path
                ref={svgLine2Ref}
                d="M 450 80 L 350 140"
                fill="none"
                stroke="#D6402C"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="opacity-40"
              />
              <path
                ref={svgLine3Ref}
                d="M 60 340 L 160 280"
                fill="none"
                stroke="#2456C9"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="opacity-40"
              />
            </svg>

            {/* Floating Connector Stat Card 1 */}
            <div className="floating-stat-card absolute -top-4 -left-2 sm:left-2 z-20 bg-white/90 backdrop-blur-md border border-[#E5E4DE] px-3.5 py-2 rounded-2xl shadow-md flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-mono-meta text-[#6B6B66]">Sources</div>
                <div className="text-xs font-bold text-[#1A1A1A]">150+ Verified Outlets</div>
              </div>
            </div>

            {/* Floating Connector Stat Card 2 */}
            <div className="floating-stat-card absolute -top-4 -right-2 sm:right-2 z-20 bg-white/90 backdrop-blur-md border border-[#E5E4DE] px-3.5 py-2 rounded-2xl shadow-md flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-[#D6402C]"></div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-mono-meta text-[#6B6B66]">Cache Window</div>
                <div className="text-xs font-bold text-[#1A1A1A]">Fresh Every 45m</div>
              </div>
            </div>

            {/* Floating Connector Stat Card 3 */}
            <div className="floating-stat-card absolute -bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md border border-[#E5E4DE] px-3.5 py-2 rounded-2xl shadow-md flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-[#2456C9]"></div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-mono-meta text-[#6B6B66]">AI Model</div>
                <div className="text-xs font-bold text-[#2456C9]">Gemini 2.5 Flash</div>
              </div>
            </div>

            {/* Main Wire Ticker Terminal Card */}
            <div
              ref={tickerRef}
              className="bg-[#1A1A1A] text-white rounded-3xl p-6 shadow-2xl border border-slate-800 w-full max-w-md relative z-10 my-6"
            >
              {/* Terminal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D6402C] animate-pulse"></span>
                  <span className="font-mono-meta text-xs font-bold tracking-widest text-slate-300 uppercase">
                    VERIS WIRE TICKER
                  </span>
                </div>
                <span className="text-[11px] font-mono-meta text-slate-500">LIVE FEED</span>
              </div>

              {/* Scrolling Headlines List */}
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-none pr-1">
                {wireHeadlines.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const element = document.getElementById('articles-feed');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-[#2456C9] transition-all flex items-start space-x-3 group cursor-pointer"
                  >
                    <span className="text-[#D6402C] font-mono-meta text-xs shrink-0 mt-0.5">• LIVE</span>
                    <div className="flex-1">
                      <p className="text-xs font-serif text-slate-200 group-hover:text-[#2456C9] line-clamp-2 leading-snug transition-colors">
                        {item.title}
                      </p>
                      <div className="text-[10px] font-mono-meta text-slate-500 mt-1 flex items-center justify-between">
                        <span>{item.source_name || 'Veris Wire'}</span>
                        <span>{item.published_at ? new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Bottom Marquee Strip */}
        <div className="bg-[#1A1A1A] text-white py-3 border-t border-slate-800 overflow-hidden relative">
          <div className="animate-marquee whitespace-nowrap flex items-center space-x-8 text-xs font-mono-meta tracking-wider uppercase text-slate-300">
            <button onClick={() => handleCategoryClick('top')} className="hover:text-white hover:underline cursor-pointer">
              🔴 VERIS TOP STORIES
            </button>
            <span>—</span>
            <button onClick={() => handleCategoryClick('business')} className="hover:text-[#2456C9] hover:underline cursor-pointer">
              BUSINESS
            </button>
            <span>—</span>
            <button onClick={() => handleCategoryClick('technology')} className="hover:text-[#2456C9] hover:underline cursor-pointer">
              TECHNOLOGY
            </button>
            <span>—</span>
            <button onClick={() => handleCategoryClick('sports')} className="hover:text-[#2456C9] hover:underline cursor-pointer">
              SPORTS
            </button>
            <span>—</span>
            <button onClick={() => handleCategoryClick('health')} className="hover:text-[#2456C9] hover:underline cursor-pointer">
              HEALTH
            </button>
            <span>—</span>
            <span className="text-[#D6402C]">
              {latestArticles[0]?.title || 'VERIS LIVE FEED CONNECTED'}
            </span>
            <span>—</span>
            <button onClick={() => handleCategoryClick('top')} className="hover:text-white hover:underline cursor-pointer">
              🔴 VERIS TOP STORIES
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
