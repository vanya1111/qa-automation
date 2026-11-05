import type { Coordinates, Geocoder } from './geocoding';

function isCoordinate(value: unknown, limit: number): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    Math.abs(value) <= limit
  );
}

export class HttpGeocoder implements Geocoder {
  constructor(private baseUrl: string) {}

  async geocode(address: string): Promise<Coordinates> {
    const response = await fetch(
      `${this.baseUrl}/geocode?address=${encodeURIComponent(address)}`,
    );
    if (!response.ok) throw new Error('GEOCODER_UNAVAILABLE');

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error('INVALID_GEOCODE_FORMAT');
    }

    const { lat, lon } = (data ?? {}) as Record<string, unknown>;
    if (!isCoordinate(lat, 90) || !isCoordinate(lon, 180)) {
      throw new Error('INVALID_GEOCODE_FORMAT');
    }
    return { lat, lon };
  }
}
