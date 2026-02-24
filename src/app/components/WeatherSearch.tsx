'use client';
import { useEffect, useState } from 'react';

type Place = {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
};

const FAV_KEY = 'weather:favorites';

export default function WeatherSearch({
  onSelect,
}: {
  onSelect: (p: Place) => void;
}) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);

  // Load favorites on mount
  useEffect(() => {
    const saved = localStorage.getItem(FAV_KEY);
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  function toggleFavorite(place: Place) {
    const exists = favorites.some(
      (p) => p.lat === place.lat && p.lon === place.lon
    );

    let updated;

    if (exists) {
      updated = favorites.filter(
        (p) => !(p.lat === place.lat && p.lon === place.lon)
      );
    } else {
      updated = [...favorites, place];
    }

    setFavorites(updated);
    localStorage.setItem(FAV_KEY, JSON.stringify(updated));
  }

  async function search() {
    if (!q.trim()) return;

    setLoading(true);
    setHasSelected(false);

    const res = await fetch(
      `/api/geocode?q=${encodeURIComponent(q)}&limit=5`
    );
    const json = await res.json();

    setResults(json || []);
    setLoading(false);
  }

  function handleSelect(place: Place) {
    onSelect(place);
    setHasSelected(true);
    setResults([]);
    setQ('');
  }

  function isFavorite(place: Place) {
    return favorites.some(
      (p) => p.lat === place.lat && p.lon === place.lon
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto my-6 space-y-4">

      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Search city (e.g. Cape Town)"
          className="flex-1 p-3 rounded-xl bg-white/20 backdrop-blur border border-white/20 text-white placeholder-white/60"
        />
        <button
          onClick={search}
          className="px-4 py-3 bg-white/20 backdrop-blur rounded-xl border border-white/20 hover:bg-white/30 transition"
        >
          Search
        </button>
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div>
          <div className="text-xs uppercase opacity-60 mb-2">
            Favorites
          </div>
          <div className="space-y-1">
            {favorites.map((p, i) => (
              <PlaceRow
                key={`fav-${i}`}
                place={p}
                onSelect={handleSelect}
                onFav={toggleFavorite}
                isFav
              />
            ))}
          </div>
        </div>
      )}

      {/* Search Results (Hidden After Selection) */}
      {!hasSelected && results.length > 0 && (
        <div className="space-y-1">
          {results.map((r, i) => (
            <PlaceRow
              key={i}
              place={r}
              onSelect={handleSelect}
              onFav={toggleFavorite}
              isFav={isFavorite(r)}
            />
          ))}
        </div>
      )}

      {loading && <div className="opacity-60">Searching...</div>}
    </div>
  );
}

function PlaceRow({
  place,
  onSelect,
  onFav,
  isFav,
}: {
  place: Place;
  onSelect: (p: Place) => void;
  onFav: (p: Place) => void;
  isFav: boolean;
}) {
  return (
    <div className="flex justify-between items-center bg-white/10 backdrop-blur rounded-xl px-4 py-3 hover:bg-white/20 transition">
      <button
        onClick={() => onSelect(place)}
        className="text-left flex-1"
      >
        {place.name}
        {place.state ? `, ${place.state}` : ''} • {place.country}
      </button>

      <button
        onClick={() => onFav(place)}
        className="text-lg ml-3"
      >
        {isFav ? '⭐' : '☆'}
      </button>
    </div>
  );
}
