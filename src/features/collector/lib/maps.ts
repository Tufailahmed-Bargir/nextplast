/**
 * Google Maps helpers for collector navigation (college-project scope).
 */

type MapCoords = {
  latitude?: number | { toString(): string } | null;
  longitude?: number | { toString(): string } | null;
};

/** Exact pin when the customer saved a map location, else the address text. */
function mapTarget(address: string, coords?: MapCoords): string {
  const lat = coords?.latitude != null ? Number(coords.latitude) : NaN;
  const lng = coords?.longitude != null ? Number(coords.longitude) : NaN;
  return Number.isFinite(lat) && Number.isFinite(lng) ? `${lat},${lng}` : address;
}

export function googleMapsSearchUrl(address: string, coords?: MapCoords): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapTarget(address, coords))}`;
}

export function googleMapsDirectionsUrl(address: string, coords?: MapCoords): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapTarget(address, coords))}`;
}

/** Haversine distance in km when coordinates exist. */
export function approximateDistanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}
