'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Languages, ExternalLink, Clock, ChevronUp, Copy, Check, RefreshCw, Newspaper } from 'lucide-react';

const LANGUAGES = [
  { code: 'Urdu', label: '🇵🇰 Urdu' },
  { code: 'English', label: '🇬🇧 English' },
  { code: 'Spanish', label: '🇪🇸 Spanish' },
  { code: 'French', label: '🇫🇷 French' },
  { code: 'Arabic', label: '🇦🇪 Arabic' },
  { code: 'Hindi', label: '🇮🇳 Hindi' }
];

export default function ArticleCard({ article, apiBaseUrl = '' }) {
  const [activeAiTab, setActiveAiTab] = useState(null);
  const [targetLang, setTargetLang] = useState('Urdu');
  const [showLangPicker, setShowLangPicker] = useState(false);
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [summaryResult, setSummaryResult] = useState('');
  const [translateResult, setTranslateResult] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // Track image load attempts: 0 = Direct, 1 = Proxied, 2 = Failed (No Image)
  const [imageState, setImageState] = useState(0);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const published = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - published) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Determine current image URL (ONLY original or proxied original, NO stock photos)
  const getImageSource = () => {
    if (!article.image_url) return null;
    if (imageState === 0) {
      return article.image_url;
    }
    if (imageState === 1) {
      return `${apiBaseUrl}/api/image-proxy?url=${encodeURIComponent(article.image_url)}`;
    }
    return null;
  };

  const handleImageError = () => {
    if (imageState === 0 && article.image_url) {
      console.log(`[Original Image Load Failed] Retrying original photo through server proxy: ${article.image_url}`);
      setImageState(1);
    } else {
      console.log(`[Original Image Unavailable] Displaying clean editorial text layout for: ${article.title}`);
      setImageState(2);
    }
  };

  // Trigger Summarize
  const handleToggleSummarize = async () => {
    if (activeAiTab === 'summary') {
      setActiveAiTab(null);
      return;
    }

    setActiveAiTab('summary');
    if (summaryResult) return;

    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/articles/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          description: article.description
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'Failed to generate summary.');
      setSummaryResult(data.summary);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger Translate
  const handleToggleTranslate = async (lang = targetLang) => {
    setTargetLang(lang);
    setShowLangPicker(false);

    if (activeAiTab === 'translate' && lang === targetLang && translateResult) {
      setActiveAiTab(null);
      return;
    }

    setActiveAiTab('translate');
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/articles/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          description: article.description,
          target_language: lang
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'Failed to generate translation.');
      setTranslateResult(data);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = activeAiTab === 'summary'
      ? summaryResult
      : translateResult ? `${translateResult.translated_title}\n\n${translateResult.translated_description}` : '';
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentImgSrc = getImageSource();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl border border-[#E5E4DE] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      {/* Photo Header (Rendered ONLY if genuine original news photo exists) */}
      {currentImgSrc ? (
        <div className="relative h-48 w-full bg-[#FAFAF8] overflow-hidden border-b border-[#E5E4DE]/60">
          <img
            src={currentImgSrc}
            alt={article.title}
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Source & Time Metadata Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#1A1A1A]/90 backdrop-blur-md text-white text-[11px] font-mono-meta font-bold shadow-md">
              {article.source_name}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#1A1A1A] text-[11px] font-mono-meta border border-[#E5E4DE] shadow-sm flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#2456C9]" />
              {formatTimeAgo(article.published_at)}
            </span>
          </div>
        </div>
      ) : (
        /* Text-Only Editorial Header Bar when no original image exists */
        <div className="px-6 pt-5 pb-2 flex items-center justify-between border-b border-[#E5E4DE]/40 bg-[#FAFAF8]">
          <span className="px-2.5 py-1 rounded-full bg-[#1A1A1A] text-white text-[11px] font-mono-meta font-bold">
            {article.source_name}
          </span>
          <span className="text-[11px] font-mono-meta text-[#6B6B66] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#2456C9]" />
            {formatTimeAgo(article.published_at)}
          </span>
        </div>
      )}

      {/* Body Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Serif Headline */}
          <h2 className="font-serif text-xl font-bold text-[#1A1A1A] leading-snug tracking-tight mb-2.5 hover:text-[#2456C9] transition-colors cursor-pointer">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
          </h2>

          {/* Description Snippet */}
          <p className="text-[#6B6B66] text-xs leading-relaxed line-clamp-3 mb-4 font-normal">
            {article.description || 'No additional summary text provided for this news dispatch.'}
          </p>
        </div>

        {/* Inline AI Expansion Container */}
        <AnimatePresence>
          {activeAiTab && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden mb-4"
            >
              <div className="p-4 rounded-2xl bg-[#F0F4FF] border border-[#2456C9]/25 text-[#1A1A1A] text-xs relative shadow-inner">
                {/* Header inside AI Box */}
                <div className="flex items-center justify-between border-b border-[#2456C9]/15 pb-2 mb-3">
                  <span className="font-bold text-[#2456C9] flex items-center gap-1.5 font-mono-meta text-[11px] uppercase">
                    {activeAiTab === 'summary' ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Gemini AI Summary
                      </>
                    ) : (
                      <>
                        <Languages className="w-3.5 h-3.5" />
                        Gemini AI Translation ({targetLang})
                      </>
                    )}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopy}
                      disabled={aiLoading}
                      className="p-1 text-[#2456C9] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                      title="Copy output"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setActiveAiTab(null)}
                      className="text-[#6B6B66] hover:text-[#1A1A1A] text-xs font-bold cursor-pointer"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content inside AI Box */}
                {aiLoading ? (
                  <div className="py-4 flex items-center justify-center space-x-2 text-[#2456C9]">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="font-mono-meta text-xs font-semibold">Generating live AI response...</span>
                  </div>
                ) : aiError ? (
                  <p className="text-rose-600 text-xs font-medium">{aiError}</p>
                ) : activeAiTab === 'summary' ? (
                  <p className="leading-relaxed text-[#1A1A1A] font-normal">
                    {summaryResult}
                  </p>
                ) : (
                  translateResult && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-[#2456C9] text-xs">
                        {translateResult.translated_title}
                      </h4>
                      <p className="leading-relaxed text-[#1A1A1A] font-normal">
                        {translateResult.translated_description}
                      </p>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons Bar */}
        <div className="pt-3 border-t border-[#E5E4DE] flex items-center justify-between gap-2 relative">
          
          {/* Summarize Action */}
          <button
            onClick={handleToggleSummarize}
            className={`flex-1 text-xs font-semibold py-2 px-3 rounded-full transition-all flex items-center justify-center gap-1.5 active:scale-95 border cursor-pointer ${
              activeAiTab === 'summary'
                ? 'bg-[#2456C9] text-white border-[#2456C9]'
                : 'bg-[#FAFAF8] text-[#1A1A1A] border-[#E5E4DE] hover:border-[#2456C9] hover:text-[#2456C9]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Summarize</span>
          </button>

          {/* Translate Action */}
          <div className="relative flex-1">
            <button
              onClick={() => handleToggleTranslate(targetLang)}
              className={`w-full text-xs font-semibold py-2 px-3 rounded-full transition-all flex items-center justify-center gap-1.5 active:scale-95 border cursor-pointer ${
                activeAiTab === 'translate'
                  ? 'bg-[#2456C9] text-white border-[#2456C9]'
                  : 'bg-[#FAFAF8] text-[#1A1A1A] border-[#E5E4DE] hover:border-[#2456C9] hover:text-[#2456C9]'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Translate ({targetLang})</span>
            </button>

            {/* Quick Language Selection Dropup */}
            <div className="absolute right-0 bottom-full mb-1">
              <button
                onClick={() => setShowLangPicker(!showLangPicker)}
                className="text-[10px] text-[#6B6B66] hover:text-[#2456C9] underline font-mono-meta block text-right mt-1 cursor-pointer"
              >
                Change Lang
              </button>

              {showLangPicker && (
                <div className="absolute right-0 bottom-full mb-2 w-36 bg-white border border-[#E5E4DE] rounded-2xl shadow-xl z-20 overflow-hidden py-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleToggleTranslate(lang.code)}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F0F4FF] hover:text-[#2456C9] transition-colors cursor-pointer"
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Direct Read Article Link */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-full bg-[#FAFAF8] border border-[#E5E4DE] text-[#6B6B66] hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-all flex items-center justify-center shrink-0"
            title="Read full story"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
