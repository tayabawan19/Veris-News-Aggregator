'use client';

import React, { useState } from 'react';
import { X, Sparkles, Languages, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';

export default function AiModal({ isOpen, onClose, modalData, onSummarize, onTranslate }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(modalData?.type || 'summary');

  if (!isOpen || !modalData) return null;

  const { article, loading, error, summary, translation, targetLang } = modalData;

  const contentToCopy = activeTab === 'summary' 
    ? summary 
    : translation ? `${translation.translated_title}\n\n${translation.translated_description}` : '';

  const handleCopy = () => {
    if (!contentToCopy) return;
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-indigo-500/20 border border-emerald-500/30">
              {activeTab === 'summary' ? (
                <Sparkles className="w-5 h-5 text-emerald-400" />
              ) : (
                <Languages className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                {activeTab === 'summary' ? 'AI Key Takeaways' : `AI Translation (${targetLang || 'Urdu'})`}
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-sm sm:max-w-md">
                {article?.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'summary'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Summary</span>
            {summary && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
          </button>

          <button
            onClick={() => setActiveTab('translate')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'translate'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Translation</span>
            {translation && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[220px] relative bg-slate-900/50">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 animate-spin opacity-20"></div>
                <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin absolute inset-0 m-auto" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {activeTab === 'summary' ? 'Generating AI Summary...' : `Translating into ${targetLang || 'target language'}...`}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Powered by Google Gemini (gemini-2.5-flash)
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Processing Error</h4>
                <p className="text-xs text-rose-300/80 mt-1">{error}</p>
              </div>
            </div>
          ) : activeTab === 'summary' ? (
            summary ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm leading-relaxed">
                  {summary}
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  * Generated by Gemini AI based on article title and available content.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400 text-xs mb-3">No summary generated for this article yet.</p>
                <button
                  onClick={() => onSummarize(article)}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-semibold text-xs rounded-xl hover:bg-emerald-400 transition-all shadow-md"
                >
                  Generate AI Summary
                </button>
              </div>
            )
          ) : (
            translation ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-200 space-y-3">
                  <h4 className="font-bold text-base text-indigo-300">
                    {translation.translated_title}
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {translation.translated_description}
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  * Translated into {targetLang || 'target language'} by Gemini AI.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400 text-xs mb-3">No translation generated for this article yet.</p>
                <button
                  onClick={() => onTranslate(article, targetLang || 'Urdu')}
                  className="px-4 py-2 bg-indigo-500 text-white font-semibold text-xs rounded-xl hover:bg-indigo-400 transition-all shadow-md"
                >
                  Translate to {targetLang || 'Urdu'}
                </button>
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={handleCopy}
            disabled={!contentToCopy || loading}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all disabled:opacity-40"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Output</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
