/**
 * Wikipedia Instant Preview Service
 * Fetches 2-sentence extracts and thumbnail images on-the-fly with client caching
 */

const wikiCache = new Map();

/**
 * Normalizes landmark/city titles to increase Wikipedia hit rates
 */
function normalizeTitle(rawTitle) {
  if (!rawTitle) return '';
  let title = rawTitle.trim();
  // Strip parentheses e.g. "Mount Everest (Chomolungma)" -> "Mount Everest"
  title = title.replace(/\s*\([^)]*\)/g, '').trim();
  // Strip slash alternatives e.g. "Uluru / Ayers Rock" -> "Uluru"
  if (title.includes('/')) {
    title = title.split('/')[0].trim();
  }
  return title;
}

/**
 * Fetches Wikipedia REST summary for a landmark or city
 */
export async function fetchWikipediaSummary(rawTitle) {
  const title = normalizeTitle(rawTitle);
  if (!title) return null;

  if (wikiCache.has(title)) {
    return wikiCache.get(title);
  }

  try {
    const encoded = encodeURIComponent(title.replace(/\s+/g, '_'));
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`;

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const result = {
        title: data.title || title,
        extract: data.extract ? truncateSentence(data.extract, 2) : '',
        thumbnail: data.thumbnail?.source || null,
        url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encoded}`,
        description: data.description || ''
      };
      wikiCache.set(title, result);
      return result;
    }
  } catch (err) {
    console.debug('Wikipedia summary not found for:', title, err);
  }

  // Cache null to prevent spamming failed lookups
  wikiCache.set(title, null);
  return null;
}

/**
 * Truncates text cleanly to N sentences
 */
function truncateSentence(text, maxSentences = 2) {
  if (!text) return '';
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 0) {
    return sentences.slice(0, maxSentences).join(' ').trim();
  }
  return text.length > 200 ? text.substring(0, 197) + '...' : text;
}
