import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, GEOCODE_URL } from './msw/server';
import {
  DeliveryAddressService,
  isInUkraine,
  type AddressRepository,
  type Geocoder,
} from '../src/geocoding';
import { HttpGeocoder } from '../src/http-geocoder';
import type { Notifier } from '../src/order-service';
import { InMemoryAddressRepository } from './fakes/in-memory-address-repository';

const KYIV = { lat: 50.4501, lon: 30.5234 };
const WARSAW = { lat: 52.2297, lon: 21.0122 };

describe('isInUkraine: межі території', () => {
  it.each([
    { name: 'Київ', lat: 50.4501, lon: 30.5234, expected: true },
    { name: 'Ужгород', lat: 48.6208, lon: 22.2879, expected: true },
    {
      name: 'південно-західний кут межі',
      lat: 44.38,
      lon: 22.13,
      expected: true,
    },
    {
      name: 'північно-східний кут межі',
      lat: 52.38,
      lon: 40.23,
      expected: true,
    },
    { name: 'lat на південній межі', lat: 44.38, lon: 30, expected: true },
    { name: 'lat на 0,001° південніше', lat: 44.379, lon: 30, expected: false },
    { name: 'lat на північній межі', lat: 52.38, lon: 30, expected: true },
    { name: 'lat на 0,001° північніше', lat: 52.381, lon: 30, expected: false },
    { name: 'lon на західній межі', lat: 48, lon: 22.13, expected: true },
    { name: 'lon на 0,001° західніше', lat: 48, lon: 22.129, expected: false },
    { name: 'lon на східній межі', lat: 48, lon: 40.23, expected: true },
    { name: 'lon на 0,001° східніше', lat: 48, lon: 40.231, expected: false },
    { name: 'Варшава', lat: 52.2297, lon: 21.0122, expected: false },
    { name: 'Стамбул', lat: 41.0082, lon: 28.9784, expected: false },
    { name: 'Нью-Йорк', lat: 40.7128, lon: -74.006, expected: false },
  ])('$name → $expected', ({ lat, lon, expected }) => {
    expect(isInUkraine({ lat, lon })).toBe(expected);
  });
});

describe('DeliveryAddressService', () => {
  let geocoder: Geocoder;
  let repo: InMemoryAddressRepository;
  let notifier: Notifier;
  let service: DeliveryAddressService;

  beforeEach(() => {
    geocoder = { geocode: vi.fn().mockResolvedValue(KYIV) }; // заглушка
    repo = new InMemoryAddressRepository(); // підробка
    notifier = { send: vi.fn().mockResolvedValue(undefined) }; // шпигун
    service = new DeliveryAddressService(geocoder, repo, notifier);
  });

  describe('адреса в межах України', () => {
    it('зберігає адресу з координатами (перевірка стану)', async () => {
      await service.registerAddress({
        id: 'D-1',
        address: 'Київ, вул. Хрещатик, 1',
        email: 'u@e.com',
      });

      const saved = await repo.findById('D-1');
      expect(saved).toEqual({
        id: 'D-1',
        address: 'Київ, вул. Хрещатик, 1',
        ...KYIV,
      });
      expect(repo.size).toBe(1);
    });

    it('передає геокодеру адресу без зайвих пробілів', async () => {
      await service.registerAddress({
        id: 'D-2',
        address: '  Львів, пл. Ринок, 1  ',
        email: 'u@e.com',
      });

      expect(geocoder.geocode).toHaveBeenCalledWith('Львів, пл. Ринок, 1');
    });

    it('надсилає клієнту лист із підтвердженою адресою (перевірка взаємодії)', async () => {
      await service.registerAddress({
        id: 'D-3',
        address: 'Одеса, вул. Дерибасівська, 5',
        email: 'client@e.com',
      });

      expect(notifier.send).toHaveBeenCalledTimes(1);
      expect(notifier.send).toHaveBeenCalledWith(
        'client@e.com',
        expect.stringContaining('Одеса, вул. Дерибасівська, 5'),
      );
    });
  });

  describe('адреса поза межами України', () => {
    it('відхиляє адресу, не зберігає її й не надсилає листа', async () => {
      geocoder = { geocode: vi.fn().mockResolvedValue(WARSAW) };
      service = new DeliveryAddressService(geocoder, repo, notifier);

      await expect(
        service.registerAddress({
          id: 'D-4',
          address: 'Варшава, ul. Marszałkowska 1',
          email: 'u@e.com',
        }),
      ).rejects.toThrow('OUT_OF_UKRAINE');

      expect(repo.size).toBe(0);
      expect(notifier.send).not.toHaveBeenCalled();
    });
  });

  describe('порожня адреса', () => {
    it.each(['', '   '])(
      'відхиляє адресу «%s» без звернення до геокодера',
      async (address) => {
        await expect(
          service.registerAddress({ id: 'D-5', address, email: 'u@e.com' }),
        ).rejects.toThrow('EMPTY_ADDRESS');

        expect(geocoder.geocode).not.toHaveBeenCalled();
      },
    );
  });

  describe('відмови залежностей', () => {
    it('геокодер недоступний: нічого не зберігається і лист не йде', async () => {
      geocoder = {
        geocode: vi.fn().mockRejectedValue(new Error('GEOCODER_UNAVAILABLE')),
      };
      service = new DeliveryAddressService(geocoder, repo, notifier);

      await expect(
        service.registerAddress({
          id: 'D-6',
          address: 'Київ',
          email: 'u@e.com',
        }),
      ).rejects.toThrow('GEOCODER_UNAVAILABLE');

      expect(repo.size).toBe(0);
      expect(notifier.send).not.toHaveBeenCalled();
    });

    it('сховище недоступне: помилка передається, лист не йде', async () => {
      const failingRepo: AddressRepository = {
        save: vi.fn().mockRejectedValue(new Error('STORAGE_FAILURE')),
        findById: vi.fn(),
      };
      service = new DeliveryAddressService(geocoder, failingRepo, notifier);

      await expect(
        service.registerAddress({
          id: 'D-7',
          address: 'Київ',
          email: 'u@e.com',
        }),
      ).rejects.toThrow('STORAGE_FAILURE');

      expect(notifier.send).not.toHaveBeenCalled();
    });
  });

  describe('разом із HttpGeocoder (MSW)', () => {
    beforeEach(() => {
      service = new DeliveryAddressService(
        new HttpGeocoder('https://geo.example.com'),
        repo,
        notifier,
      );
    });

    it('приймає адресу, яку HTTP-сервіс геокодував у Києві', async () => {
      const record = await service.registerAddress({
        id: 'D-8',
        address: 'Київ',
        email: 'u@e.com',
      });

      expect(record.lat).toBeCloseTo(50.4501, 4);
      expect(repo.size).toBe(1);
    });

    it('відхиляє адресу, яку HTTP-сервіс геокодував у Варшаві', async () => {
      server.use(http.get(GEOCODE_URL, () => HttpResponse.json(WARSAW)));

      await expect(
        service.registerAddress({
          id: 'D-9',
          address: 'Варшава',
          email: 'u@e.com',
        }),
      ).rejects.toThrow('OUT_OF_UKRAINE');

      expect(repo.size).toBe(0);
    });
  });
});
