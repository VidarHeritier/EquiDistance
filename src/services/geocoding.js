/**
 * Geocoding Service: Combines local curated world database with OpenStreetMap Nominatim
 */

import { searchCities, MAJOR_CITIES } from '../data/cities.js';

const cache = new Map();

/**
 * Search locations by name or query
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim();

  // Check memory cache first
  const cacheKey = `search:${q.toLowerCase()}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // 1. Local curated results (immediate)
  const localResults = searchCities(q, 6);

  // 2. Fetch from OpenStreetMap Nominatim API for comprehensive worldwide coverage
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const osmResults = data.map(item => {
        const country = item.address?.country || '';
        const state = item.address?.state || '';
        const cityName = item.address?.city || item.address?.town || item.address?.village || item.name;
        
        return {
          name: cityName || item.display_name.split(',')[0],
          country: country || state,
          fullName: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          source: 'osm'
        };
      });

      // Merge and deduplicate
      const combined = [...localResults];
      for (const item of osmResults) {
        const exists = combined.some(c => 
          Math.abs(c.lat - item.lat) < 0.2 && Math.abs(c.lon - item.lon) < 0.2
        );
        if (!exists) {
          combined.push(item);
        }
      }

      cache.set(cacheKey, combined);
      return combined;
    }
  } catch {
    // Network error or timeout, silently fallback to local results
  }

  cache.set(cacheKey, localResults);
  return localResults;
}

let geocodeQueue = Promise.resolve();

/**
 * Reverse geocode a lat/lon to human-readable address
 * Uses a sequential throttled queue to prevent rate limiting from Nominatim
 */
export async function reverseGeocode(lat, lon) {
  const cacheKey = `rev:${lat.toFixed(3)},${lon.toFixed(3)}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  return new Promise((resolve) => {
    geocodeQueue = geocodeQueue.then(async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'EquiDistance-Explorer/1.0 (https://github.com/equidistance)'
          }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};
          
          const locality = addr.city || addr.town || addr.municipality || addr.village || addr.hamlet || addr.county || addr.island || data.name;
          const region = addr.state || addr.province || addr.county || '';
          const country = addr.country || '';

          const parts = [];
          if (locality) parts.push(locality);
          if (region && region !== locality) parts.push(region);
          if (country && country !== region && country !== locality) parts.push(country);

          const place = {
            name: locality || data.display_name?.split(',')[0],
            formatted: parts.join(', ') || data.display_name,
            country: country,
            state: region,
            displayName: data.display_name
          };

          cache.set(cacheKey, place);
          resolve(place);
          await new Promise(r => setTimeout(r, 200));
          return;
        }
      } catch {
        // Fallback if offline
      }
      resolve(null);
      await new Promise(r => setTimeout(r, 100));
    });
  });
}
