require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-supabase-project.supabase.co') {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('Warning: Supabase credentials not set or using placeholders. In-memory caching layer active.');
}

// In-Memory Caching Layer (Key: `${country}:${city||all}:${category||all}`)
const memoryCache = new Map();
const CACHE_TTL_MS = 45 * 60 * 1000; // 45 minutes

// Helper to call Gemini model
async function generateGeminiContent(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-api-key') {
    throw new Error('GEMINI_API_KEY is not configured in .env file.');
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (sdkError) {
    console.warn('Gemini SDK call failed, trying direct REST call fallback:', sdkError.message);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const restResponse = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }]
    });
    return restResponse.data.candidates[0].content.parts[0].text;
  }
}

// Static list of supported countries
const SUPPORTED_COUNTRIES = [
  { code: 'pk', name: 'Pakistan' },
  { code: 'in', name: 'India' },
  { code: 'us', name: 'United States' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'ae', name: 'United Arab Emirates' }
];

// Helper: Filter articles by timeframe
function filterByTimeframe(articles, timeframe) {
  const now = Date.now();
  const timeLimit = timeframe === 'week' 
    ? now - 7 * 24 * 60 * 60 * 1000 
    : now - 24 * 60 * 60 * 1000;

  return articles.filter(article => {
    if (!article.published_at) return true;
    const pubTime = new Date(article.published_at).getTime();
    return pubTime >= timeLimit;
  });
}

// Helper: Format articles to clean JSON structure
function formatArticles(articles) {
  return articles.map(a => ({
    title: a.title || 'Untitled',
    description: a.description || '',
    source_name: a.source_name || 'Unknown',
    url: a.url || '',
    image_url: a.image_url || null,
    published_at: a.published_at
  }));
}

// Health Check
app.get('/', (req, res) => {
  res.send('API running');
});

// GET /api/news/countries
app.get('/api/news/countries', (req, res) => {
  res.json(SUPPORTED_COUNTRIES);
});

// GET /api/news
app.get('/api/news', async (req, res) => {
  const { country, city, category, timeframe = 'today' } = req.query;

  if (!country) {
    return res.status(400).json({ error: "Query parameter 'country' is required (e.g. country=pk)." });
  }

  const countryLower = country.toLowerCase();
  const cityLower = city ? city.toLowerCase().trim() : null;
  const categoryLower = category ? category.toLowerCase().trim() : null;

  // Category-specific Cache Key
  const cacheKey = `${countryLower}:${cityLower || 'all'}:${categoryLower || 'all'}`;
  const now = Date.now();

  console.log(`[GET /api/news] Query params: country="${countryLower}", city="${cityLower}", category="${categoryLower}", timeframe="${timeframe}" | CacheKey="${cacheKey}"`);

  // 1. Check In-Memory Cache first
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      console.log(`[IN-MEMORY CACHE HIT] Key: "${cacheKey}" - ${cached.articles.length} items in cache.`);
      let filtered = filterByTimeframe(cached.articles, timeframe);
      if (filtered.length === 0 && cached.articles.length > 0) {
        console.log(`[TIMEFRAME FALLBACK] 0 items within strict timeframe, returning all ${cached.articles.length} cached items.`);
        filtered = cached.articles;
      }
      return res.json(formatArticles(filtered));
    }
  }

  // 2. Check Supabase Cache if available
  if (supabase) {
    try {
      const minutesAgo45 = new Date(Date.now() - 45 * 60 * 1000).toISOString();

      let cacheQuery = supabase
        .from('cached_articles')
        .select('*')
        .eq('country', countryLower)
        .gte('cached_at', minutesAgo45);

      if (cityLower) {
        cacheQuery = cacheQuery.eq('city_keyword', cityLower);
      } else {
        cacheQuery = cacheQuery.is('city_keyword', null);
      }

      if (categoryLower) {
        cacheQuery = cacheQuery.eq('category', categoryLower);
      } else {
        cacheQuery = cacheQuery.is('category', null);
      }

      const { data: cachedArticles, error: cacheError } = await cacheQuery;

      if (!cacheError && cachedArticles && cachedArticles.length > 0) {
        console.log(`[SUPABASE CACHE HIT] Key: "${cacheKey}" - Found ${cachedArticles.length} items.`);
        memoryCache.set(cacheKey, { timestamp: Date.now(), articles: cachedArticles });
        let filtered = filterByTimeframe(cachedArticles, timeframe);
        if (filtered.length === 0 && cachedArticles.length > 0) {
          filtered = cachedArticles;
        }
        return res.json(formatArticles(filtered));
      }
    } catch (err) {
      console.error('Unexpected error checking Supabase cache:', err);
    }
  }

  // 3. Cache Miss: Fetch fresh data from NewsData.io
  console.log(`[CACHE MISS / FETCHING EXTERNAL] Querying NewsData.io API for category="${categoryLower || 'all'}"...`);
  try {
    const apiKey = process.env.NEWSDATA_API_KEY;
    if (!apiKey || apiKey === 'your-newsdata-api-key') {
      return res.status(500).json({
        error: "NEWSDATA_API_KEY is not configured in .env file."
      });
    }

    const params = {
      apikey: apiKey,
      country: countryLower
    };

    if (categoryLower) {
      params.category = categoryLower;
    }
    if (cityLower) {
      params.q = cityLower;
    }

    console.log('[NEWSDATA.IO API CALL] Request params:', JSON.stringify(params));
    const apiResponse = await axios.get('https://newsdata.io/api/1/latest', { params });
    const rawResults = apiResponse.data.results || [];
    console.log(`[NEWSDATA.IO API SUCCESS] Received ${rawResults.length} articles for category="${categoryLower || 'all'}".`);

    const articlesToInsert = rawResults.map(art => ({
      source_api_id: art.article_id || art.link,
      title: art.title || 'Untitled',
      description: art.description || art.content || '',
      source_name: art.source_id || art.source_name || 'Unknown',
      url: art.link || '',
      image_url: art.image_url || null,
      country: countryLower,
      city_keyword: cityLower,
      category: categoryLower,
      published_at: art.pubDate ? new Date(art.pubDate).toISOString() : new Date().toISOString(),
      cached_at: new Date().toISOString()
    }));

    // Cache in memory
    memoryCache.set(cacheKey, {
      timestamp: Date.now(),
      articles: articlesToInsert
    });

    // Cache in Supabase if configured
    if (supabase && articlesToInsert.length > 0) {
      const { error: upsertError } = await supabase
        .from('cached_articles')
        .upsert(articlesToInsert, { onConflict: 'source_api_id' });

      if (upsertError) {
        console.error('Supabase Upsert Error:', upsertError.message);
      }
    }

    let filtered = filterByTimeframe(articlesToInsert, timeframe);
    if (filtered.length === 0 && articlesToInsert.length > 0) {
      filtered = articlesToInsert;
    }
    return res.json(formatArticles(filtered));

  } catch (apiError) {
    const errorDetails = apiError.response?.data || apiError.message;
    console.warn('NewsData.io API Request Warning:', JSON.stringify(errorDetails));

    // Fallback 1: Return memory cache entry for THIS category even if expired
    if (memoryCache.has(cacheKey)) {
      const staleEntry = memoryCache.get(cacheKey);
      console.log(`[MEMORY STALE FALLBACK] Returning ${staleEntry.articles.length} stale items for "${cacheKey}".`);
      res.setHeader('X-News-Source', 'memory-stale-fallback');
      return res.json(formatArticles(staleEntry.articles));
    }

    // Fallback 2: Return ANY cached category entry for this country to avoid breaking UI
    for (const [key, entry] of memoryCache.entries()) {
      if (key.startsWith(`${countryLower}:`) && entry.articles && entry.articles.length > 0) {
        console.log(`[CROSS-CATEGORY FALLBACK] Returning ${entry.articles.length} cached items from key "${key}" due to API rate limit.`);
        res.setHeader('X-News-Source', 'cross-category-fallback');
        return res.json(formatArticles(entry.articles));
      }
    }

    // Fallback 3: Check Supabase if available
    if (supabase) {
      try {
        let fallbackQuery = supabase
          .from('cached_articles')
          .select('*')
          .eq('country', countryLower);

        const { data: staleArticles } = await fallbackQuery;

        if (staleArticles && staleArticles.length > 0) {
          console.log(`[SUPABASE STALE FALLBACK] Returning ${staleArticles.length} stale items.`);
          res.setHeader('X-News-Source', 'supabase-stale-fallback');
          return res.json(formatArticles(staleArticles));
        }
      } catch (fallbackErr) {
        console.error('Fallback query failed:', fallbackErr);
      }
    }

    // Fallback 4: Return clean empty array with 200 OK so frontend shows friendly rate-limit banner instead of 502 overlay
    console.log('[EMPTY FALLBACK] Returning empty array with 200 OK due to API rate limit.');
    return res.json([]);
  }
});

// POST /api/articles/summarize
app.post('/api/articles/summarize', async (req, res) => {
  const { title, description } = req.body;

  if (!title && !description) {
    return res.status(400).json({ error: "Article 'title' or 'description' is required in body." });
  }

  try {
    const prompt = `You are a professional news editor. Provide a concise 2-3 sentence summary of the following news article:

Title: ${title || 'Untitled'}
Description: ${description || ''}`;

    const summaryText = await generateGeminiContent(prompt);
    return res.json({ summary: summaryText.trim() });
  } catch (err) {
    console.error('Summarize error:', err.message);
    return res.status(500).json({
      error: "Failed to generate summary.",
      details: err.message
    });
  }
});

// POST /api/articles/translate
app.post('/api/articles/translate', async (req, res) => {
  const { title, description, target_language = 'English' } = req.body;

  if (!title && !description) {
    return res.status(400).json({ error: "Article 'title' or 'description' is required in body." });
  }

  try {
    const prompt = `Translate the following news article title and description into ${target_language}. Preserve the original meaning, context, and tone.
Return ONLY a raw JSON object with keys "translated_title" and "translated_description". Do NOT wrap in markdown formatting or code blocks.

Title: ${title || ''}
Description: ${description || ''}`;

    const rawResult = await generateGeminiContent(prompt);
    
    let cleaned = rawResult.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    try {
      const parsed = JSON.parse(cleaned);
      return res.json({
        translated_title: parsed.translated_title || title || '',
        translated_description: parsed.translated_description || description || ''
      });
    } catch (parseError) {
      return res.json({
        translated_title: title || '',
        translated_description: cleaned
      });
    }
  } catch (err) {
    console.error('Translate error:', err.message);
    return res.status(500).json({
      error: "Failed to translate article.",
      details: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
