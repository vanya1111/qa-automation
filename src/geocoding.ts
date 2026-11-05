import type { Notifier } from './order-service';

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Geocoder {
  geocode(address: string): Promise<Coordinates>;
}

export interface AddressInput {
  id: string;
  address: string;
  email: string;
}

export interface AddressRecord {
  id: string;
  address: string;
  lat: number;
  lon: number;
}

export interface AddressRepository {
  save(record: AddressRecord): Promise<void>;
  findById(id: string): Promise<AddressRecord | undefined>;
}

/**
 * Прямокутна межа території України (з невеликим запасом назовні).
 * Це наближення: точки поблизу кордону в сусідніх країнах можуть
 * потрапити всередину, для точної перевірки потрібен полігон кордону.
 */
export const UKRAINE_BOUNDS = {
  minLat: 44.38,
  maxLat: 52.38,
  minLon: 22.13,
  maxLon: 40.23,
} as const;

export function isInUkraine({ lat, lon }: Coordinates): boolean {
  return (
    lat >= UKRAINE_BOUNDS.minLat &&
    lat <= UKRAINE_BOUNDS.maxLat &&
    lon >= UKRAINE_BOUNDS.minLon &&
    lon <= UKRAINE_BOUNDS.maxLon
  );
}

export class DeliveryAddressService {
  constructor(
    private geocoder: Geocoder,
    private repo: AddressRepository,
    private notifier: Notifier,
  ) {}

  async registerAddress(input: AddressInput): Promise<AddressRecord> {
    const address = input.address.trim();
    if (address === '') throw new Error('EMPTY_ADDRESS');

    const { lat, lon } = await this.geocoder.geocode(address);
    if (!isInUkraine({ lat, lon })) throw new Error('OUT_OF_UKRAINE');

    const record: AddressRecord = { id: input.id, address, lat, lon };
    await this.repo.save(record);
    await this.notifier.send(
      input.email,
      `Адресу доставки «${address}» підтверджено`,
    );
    return record;
  }
}
