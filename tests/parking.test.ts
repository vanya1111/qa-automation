import { it, expect } from 'vitest';
import { calcParkingFee, round2 } from '../src/parking';

it.each([-1, -60, 10.5])('відхиляє тривалість %s', (minutes) => {
  expect(() => calcParkingFee(minutes)).toThrow('INVALID_DURATION');
});
 
it.each([0, 1, 15])('перші 15 хвилин безкоштовні: %i', (minutes) => {
  expect(calcParkingFee(minutes)).toBe(0);
});

it.each([
  { minutes: 15, expected: 0 },
  { minutes: 16, expected: 30 },
  { minutes: 60, expected: 30 },
])('тривалість $minutes → $expected', ({ minutes, expected }) => {
  expect(calcParkingFee(minutes)).toBe(expected);
});
 
it.each([
  { minutes: 61, expected: 50 },
  { minutes: 120, expected: 50 },
  { minutes: 121, expected: 70 },
  { minutes: 180, expected: 70 },
])('тривалість $minutes → $expected', ({ minutes, expected }) => {
  expect(calcParkingFee(minutes)).toBe(expected);
});
 
it.each([
  { minutes: 540, expected: 190 },
  { minutes: 600, expected: 200 },
  { minutes: 1440, expected: 200 },
])('обмеження добової плати: $minutes → $expected', ({ minutes, expected }) => {
  expect(calcParkingFee(minutes)).toBe(expected);
});
 
it.each([
  { minutes: 60, expected: 15 },
  { minutes: 121, expected: 35 },
  { minutes: 600, expected: 100 },
])('нічний тариф: $minutes → $expected', ({ minutes, expected }) => {
  expect(calcParkingFee(minutes, { night: true })).toBeCloseTo(expected, 2);
});
 
it.each([
  { minutes: 600, opts: { weekend: true }, expected: 160 },
  { minutes: 600, opts: { night: true, weekend: true }, expected: 80 },
])('вихідний: $minutes $opts → $expected', ({ minutes, opts, expected }) => {
  expect(calcParkingFee(minutes, opts)).toBeCloseTo(expected, 2);
});
 
// Увага: цей тест пройде ОДРАЗУ. Тарифи кратні 10, множники 0,5 і 0,8 не
// дають зайвих знаків, тож заокруглення через публічну функцію не помітне.
it('заокруглює результат до копійок', () => {
  // 45 хв, ніч, вихідний: 30 / 2 * 0.8 = 12
  expect(calcParkingFee(45, { night: true, weekend: true })).toBe(12);
  // 121 хв, ніч, вихідний: 70 / 2 * 0.8 = 28
  expect(calcParkingFee(121, { night: true, weekend: true })).toBe(28);
});
 
// Справжній Red: перевіряємо допоміжну функцію напряму.
it.each([
  { value: 0.1 + 0.2, expected: 0.3 },
  { value: 1.239, expected: 1.24 },
  { value: 1.231, expected: 1.23 },
  { value: 7, expected: 7 },
])('round2($value) → $expected', ({ value, expected }) => {
  expect(round2(value)).toBe(expected);
});
