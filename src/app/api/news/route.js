import { NextResponse } from 'next/server';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-supabase-project.supabase.co') {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// In-Memory Caching Layer
const memoryCache = new Map();
const CACHE_TTL_MS = 45 * 60 * 1000; // 45 minutes

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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const city = searchParams.get('city');
  const category = searchParams.get('category');
  const timeframe = searchParams.get('timeframe') || 'today';

  if (!country) {
    return NextResponse.json({ error: "Query parameter 'country' is required." }, { status: 400 });
  }

  const countryLower = country.toLowerCase();
  const cityLower = city ? city.toLowerCase().trim() : null;
  const categoryLower = category ? category.toLowerCase().trim() : null;

  const cacheKey = `${countryLower}:${cityLower || 'all'}:${categoryLower || 'all'}`;
  const now = Date.now();

  // 1. Check In-Memory Cache
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      let filtered = filterByTimeframe(cached.articles, timeframe);
      if (filtered.length === 0 && cached.articles.length > 0) {
        filtered = cached.articles;
      }
      return NextResponse.json(formatArticles(filtered));
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
        memoryCache.set(cacheKey, { timestamp: Date.now(), articles: cachedArticles });
        let filtered = filterByTimeframe(cachedArticles, timeframe);
        if (filtered.length === 0 && cachedArticles.length > 0) {
          filtered = cachedArticles;
        }
        return NextResponse.json(formatArticles(filtered));
      }
    } catch (err) {
      console.error('Supabase check error:', err);
    }
  }

  // 3. Cache Miss: Fetch fresh data from NewsData.io
  try {
    const apiKey = process.env.NEWSDATA_API_KEY;
    if (!apiKey || apiKey === 'your-newsdata-api-key') {
      return NextResponse.json({ error: "NEWSDATA_API_KEY is not configured." }, { status: 500 });
    }

    const params = {
      apikey: apiKey,
      country: countryLower
    };

    if (categoryLower) params.category = categoryLower;
    if (cityLower) params.q = cityLower;

    const apiResponse = await axios.get('https://newsdata.io/api/1/latest', { params });
    const rawResults = apiResponse.data.results || [];

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

    memoryCache.set(cacheKey, {
      timestamp: Date.now(),
      articles: articlesToInsert
    });

    if (supabase && articlesToInsert.length > 0) {
      await supabase
        .from('cached_articles')
        .upsert(articlesToInsert, { onConflict: 'source_api_id' });
    }

    let filtered = filterByTimeframe(articlesToInsert, timeframe);
    if (filtered.length === 0 && articlesToInsert.length > 0) {
      filtered = articlesToInsert;
    }
    return NextResponse.json(formatArticles(filtered));

  } catch (apiError) {
    console.warn('NewsData.io API Error:', apiError.response?.data || apiError.message);

    // Fallback 1: Return memory cache for THIS category
    if (memoryCache.has(cacheKey)) {
      const staleEntry = memoryCache.get(cacheKey);
      return NextResponse.json(formatArticles(staleEntry.articles));
    }

    // Fallback 2: Return ANY cached category for this country
    for (const [key, entry] of memoryCache.entries()) {
      if (key.startsWith(`${countryLower}:`) && entry.articles && entry.articles.length > 0) {
        return NextResponse.json(formatArticles(entry.articles));
      }
    }

    // Fallback 3: Return empty array with 200 OK
    return NextResponse.json([]);
  }
}
