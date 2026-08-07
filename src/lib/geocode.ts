export interface GeocodeResult {
  lat: number;
  lng: number;
}

export interface LocationSuggestion {
  label: string;
  lat: number;
  lng: number;
}

export const searchLocations = async (
  query: string
): Promise<LocationSuggestion[]> => {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const params = new URLSearchParams({
      q: trimmed,
      format: "json",
      limit: "5",
      addressdetails: "1",
    });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          "User-Agent": "bentoh.me/1.0 (https://bentoh.me)",
        },
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    if (!Array.isArray(json)) return [];

    return json
      .map((item: any) => {
        const address = item.address ?? {};
        // Nominatim's display_name is a long full address — build a short
        // "City, Country" label instead so it fits the location field.
        const place =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          address.county ||
          address.state ||
          (item.display_name as string)?.split(",")[0];
        const label = address.country
          ? `${place}, ${address.country}`
          : place || (item.display_name as string);

        return {
          label,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        };
      })
      .filter(
        (r: LocationSuggestion) =>
          r.label && !Number.isNaN(r.lat) && !Number.isNaN(r.lng)
      );
  } catch {
    return [];
  }
};

// Free geocoding via OpenStreetMap's Nominatim — no API key needed. Usage
// policy requires an identifying User-Agent and caps us at ~1 req/s, which
// is a non-issue here since this only runs on the debounced save of the
// location field, not on every page view.
export const geocodeLocation = async (
  query: string
): Promise<GeocodeResult | null> => {
  const trimmed = query.trim();
  if (!trimmed) return null;

  try {
    const params = new URLSearchParams({
      q: trimmed,
      format: "json",
      limit: "1",
    });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          "User-Agent": "bentoh.me/1.0 (https://bentoh.me)",
        },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const first = json?.[0];
    if (!first) return null;

    const lat = parseFloat(first.lat);
    const lng = parseFloat(first.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
};
