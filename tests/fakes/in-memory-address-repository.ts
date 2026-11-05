import type { AddressRecord, AddressRepository } from '../../src/geocoding';

export class InMemoryAddressRepository implements AddressRepository {
  private items = new Map<string, AddressRecord>();

  async save(record: AddressRecord): Promise<void> {
    this.items.set(record.id, record);
  }

  async findById(id: string): Promise<AddressRecord | undefined> {
    return this.items.get(id);
  }

  get size(): number {
    return this.items.size;
  }
}
