import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, GEOCODE_URL } from './msw/server';
import { HttpGeocoder } from '../src/http-geocoder';

const geocoder = new HttpGeocoder('https://geo.example.com');

describe('HttpGeocoder', () => {
  describe('успішна відповідь', () => {
    it('повертає координати з відповіді', async () => {
      await expect(geocoder.geocode('Київ')).resolves.toEqual({
        lat: 50.4501,
        lon: 30.5234,
      });
    });

    it('передає адресу в запит із кодуванням спецсимволів', async () => {
      let captured: URL | undefined;
      server.use(
        http.get(GEOCODE_URL, ({ request }) => {
          captured = new URL(request.url);
          return HttpResponse.json({ lat: 50.45, lon: 30.52 });
        }),
      );

      await geocoder.geocode('Київ, вул. Хрещатик, 1');

      expect(captured?.searchParams.get('address')).toBe(
        'Київ, вул. Хрещатик, 1',
      );
    });
  });

  describe('помилковий статус', () => {
    it.each([404, 500, 503])(
      'відхиляє відповідь зі статусом %i',
      async (status) => {
        server.use(
          http.get(GEOCODE_URL, () => new HttpResponse(null, { status })),
        );

        await expect(geocoder.geocode('Київ')).rejects.toThrow(
          'GEOCODER_UNAVAILABLE',
        );
      },
    );

    it('опрацьовує мережеву помилку', async () => {
      server.use(http.get(GEOCODE_URL, () => HttpResponse.error()));

      await expect(geocoder.geocode('Київ')).rejects.toThrow();
    });
  });

  describe('некоректний формат відповіді', () => {
    it.each([
      { name: 'lat у вигляді рядка', body: { lat: '50.45', lon: 30.52 } },
      { name: 'відсутнє поле lon', body: { lat: 50.45 } },
      { name: 'порожній об’єкт', body: {} },
      { name: 'null замість об’єкта', body: null },
      { name: 'lat поза діапазоном −90…90', body: { lat: 123, lon: 30.52 } },
      { name: 'lon поза діапазоном −180…180', body: { lat: 50, lon: 200 } },
    ])('відхиляє: $name', async ({ body }) => {
      server.use(http.get(GEOCODE_URL, () => HttpResponse.json(body)));

      await expect(geocoder.geocode('Київ')).rejects.toThrow(
        'INVALID_GEOCODE_FORMAT',
      );
    });

    it('відхиляє тіло, що не є JSON', async () => {
      server.use(
        http.get(
          GEOCODE_URL,
          () =>
            new HttpResponse('<html>помилка</html>', {
              headers: { 'Content-Type': 'text/html' },
            }),
        ),
      );

      await expect(geocoder.geocode('Київ')).rejects.toThrow(
        'INVALID_GEOCODE_FORMAT',
      );
    });
  });
});
