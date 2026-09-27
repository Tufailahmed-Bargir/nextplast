import "server-only";

import { normalizeIndianState } from "@/constants/indian-states";
import type {
  AddressParts,
  GeoAddressSuggestion,
  PincodeLookupResult,
  ReverseGeocodeResult,
} from "@/features/geo/types";
import { logger } from "@/utils/logger";

/**
 * Free address helpers for India:
 * - India Post PIN lookup (api.postalpincode.in)
 * - Photon place search for type-ahead (photon.komoot.io)
 * - Nominatim reverse geocoding for "use my location" (nominatim.openstreetmap.org)
 * All calls fail soft: callers get "unavailable"/empty results, never a throw.
 */

// OSM usage policies require an identifying User-Agent.
const USER_AGENT = "NexPlast/1.0 (plastic pickup address lookup)";
const REQUEST_TIMEOUT_MS = 6000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Photon bbox is minLon,minLat,maxLon,maxLat.
const INDIA_BBOX = "68.1,6.5,97.4,35.7";

type CacheEntry<T> = { value: T; expiresAt: number };

function createCache<T>(ttlMs: number, maxEntries = 500) {
  const store = new Map<string, CacheEntry<T>>();
  return {
    get(key: string): T | undefined {
      const hit = store.get(key);
      if (!hit) return undefined;
      if (hit.expiresAt <= Date.now()) {
        store.delete(key);
        return undefined;
      }
      return hit.value;
    },
    set(key: string, value: T) {
      if (store.size >= maxEntries) {
        const oldest = store.keys().next().value;
        if (oldest !== undefined) store.delete(oldest);
      }
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
  };
}

const pincodeCache = createCache<PincodeLookupResult>(DAY_MS);
const searchCache = createCache<GeoAddressSuggestion[]>(60 * 60 * 1000);
const reverseCache = createCache<ReverseGeocodeResult | null>(DAY_MS);

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  return res.json();
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function uniqueJoin(values: string[]): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v.toLowerCase();
    if (!v || seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out.join(", ");
}

function normalizePin(value: unknown): string {
  const digits = clean(value).replace(/\s/g, "");
  return /^[1-9]\d{5}$/.test(digits) ? digits : "";
}

// ---------------------------------------------------------------------------
// India Post PIN lookup
// ---------------------------------------------------------------------------

type IndiaPostOffice = {
  Name?: string;
  District?: string;
  State?: string;
  Country?: string;
};

type IndiaPostResponse = {
  Status?: string;
  PostOffice?: IndiaPostOffice[] | null;
}[];

export async function lookupPincode(pinCode: string): Promise<PincodeLookupResult> {
  const cached = pincodeCache.get(pinCode);
  if (cached) return cached;

  try {
    const data = (await fetchJson(
      `https://api.postalpincode.in/pincode/${encodeURIComponent(pinCode)}`,
    )) as IndiaPostResponse;

    const entry = Array.isArray(data) ? data[0] : undefined;
    const offices = entry?.PostOffice ?? [];

    if (entry?.Status !== "Success" || offices.length === 0) {
      const result: PincodeLookupResult = { status: "not_found", pinCode };
      pincodeCache.set(pinCode, result);
      return result;
    }

    const first = offices[0];
    const localities = Array.from(
      new Set(offices.map((o) => clean(o.Name)).filter(Boolean)),
    ).slice(0, 12);

    const result: PincodeLookupResult = {
      status: "found",
      pinCode,
      city: clean(first?.District),
      state: normalizeIndianState(first?.State) || clean(first?.State),
      localities,
    };
    pincodeCache.set(pinCode, result);
    return result;
  } catch (error) {
    logger.warn(
      "PIN lookup unavailable",
      { pinCode, error: error instanceof Error ? error.message : "unknown" },
      "geo",
    );
    return { status: "unavailable", pinCode };
  }
}

// ---------------------------------------------------------------------------
// Photon place search (type-ahead)
// ---------------------------------------------------------------------------

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: Record<string, unknown>;
};

function photonToSuggestion(feature: PhotonFeature): GeoAddressSuggestion | null {
  const p = feature.properties ?? {};
  const coords = feature.geometry?.coordinates;
  if (!coords || clean(p.countrycode).toUpperCase() !== "IN") return null;

  const [longitude, latitude] = coords;
  const name = clean(p.name);
  const street = clean(p.street);
  const locality = clean(p.locality);
  const district = clean(p.district);
  const city = clean(p.city) || clean(p.county) || district;
  const state = normalizeIndianState(clean(p.state));

  const area = uniqueJoin(
    [name !== city ? name : "", street, locality, district !== city ? district : ""].filter(
      Boolean,
    ),
  );

  const parts: Partial<AddressParts> = {
    house: clean(p.housenumber),
    street: area,
    city,
    state,
    pinCode: normalizePin(p.postcode),
  };

  const label = name || street || locality || city;
  if (!label) return null;

  return {
    id: `${clean(p.osm_type)}${String(p.osm_id ?? `${latitude},${longitude}`)}`,
    label,
    secondary: uniqueJoin(
      [street !== label ? street : "", locality, city, clean(p.state), clean(p.postcode)].filter(
        Boolean,
      ),
    ),
    parts,
    latitude,
    longitude,
  };
}

export async function searchPlaces(input: {
  query: string;
  lat?: number;
  lng?: number;
}): Promise<GeoAddressSuggestion[]> {
  const params = new URLSearchParams({
    q: input.query,
    limit: "8",
    lang: "en",
    bbox: INDIA_BBOX,
  });
  if (input.lat !== undefined && input.lng !== undefined) {
    params.set("lat", input.lat.toFixed(3));
    params.set("lon", input.lng.toFixed(3));
  }

  const cacheKey = params.toString().toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  try {
    const data = (await fetchJson(`https://photon.komoot.io/api/?${params}`)) as {
      features?: PhotonFeature[];
    };
    const seen = new Set<string>();
    const suggestions: GeoAddressSuggestion[] = [];
    for (const feature of data.features ?? []) {
      const s = photonToSuggestion(feature);
      if (!s) continue;
      const key = `${s.label}|${s.secondary}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      suggestions.push(s);
      if (suggestions.length >= 6) break;
    }
    searchCache.set(cacheKey, suggestions);
    return suggestions;
  } catch (error) {
    logger.warn(
      "Place search unavailable",
      { error: error instanceof Error ? error.message : "unknown" },
      "geo",
    );
    return [];
  }
}

// ---------------------------------------------------------------------------
// Nominatim reverse geocoding ("use my current location")
// ---------------------------------------------------------------------------

// Nominatim public policy: at most 1 request per second across the whole app.
let nominatimQueue: Promise<void> = Promise.resolve();
let lastNominatimCall = 0;

function throttleNominatim(): Promise<void> {
  const run = nominatimQueue.then(async () => {
    const wait = lastNominatimCall + 1100 - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastNominatimCall = Date.now();
  });
  nominatimQueue = run.catch(() => undefined);
  return run;
}

type NominatimReverse = {
  display_name?: string;
  address?: Record<string, string | undefined>;
};

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult | null> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = reverseCache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    await throttleNominatim();
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(lat),
      lon: String(lng),
      zoom: "18",
      addressdetails: "1",
      "accept-language": "en",
    });
    const contactEmail = process.env.NOMINATIM_CONTACT_EMAIL;
    if (contactEmail) params.set("email", contactEmail);

    const data = (await fetchJson(
      `https://nominatim.openstreetmap.org/reverse?${params}`,
    )) as NominatimReverse;

    const a = data.address;
    if (!a || clean(a.country_code).toLowerCase() !== "in") {
      reverseCache.set(cacheKey, null);
      return null;
    }

    const city =
      clean(a.city) ||
      clean(a.town) ||
      clean(a.village) ||
      clean(a.county) ||
      clean(a.state_district);

    const result: ReverseGeocodeResult = {
      parts: {
        house: clean(a.house_number),
        street: uniqueJoin(
          [
            clean(a.building),
            clean(a.road),
            clean(a.neighbourhood),
            clean(a.suburb) || clean(a.quarter),
            clean(a.city_district) !== city ? clean(a.city_district) : "",
          ].filter(Boolean),
        ),
        city,
        state: normalizeIndianState(a.state),
        pinCode: normalizePin(a.postcode),
      },
      latitude: lat,
      longitude: lng,
      displayName: clean(data.display_name),
    };
    reverseCache.set(cacheKey, result);
    return result;
  } catch (error) {
    logger.warn(
      "Reverse geocode unavailable",
      { error: error instanceof Error ? error.message : "unknown" },
      "geo",
    );
    return null;
  }
}
