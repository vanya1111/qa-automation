import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const RATE_URL = 'https://api.example.com/rate';
export const GEOCODE_URL = 'https://geo.example.com/geocode';

export const handlers = [
  http.get(RATE_URL, () => HttpResponse.json({ rate: 41.25 })),
  http.get(GEOCODE_URL, () =>
    HttpResponse.json({ lat: 50.4501, lon: 30.5234 }),
  ),
];

export const server = setupServer(...handlers);
