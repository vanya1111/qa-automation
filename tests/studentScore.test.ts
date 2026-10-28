import { describe, it, expect } from 'vitest';
import { calcTotalScore, toEctsGrade } from '../src/studentScore';
 
const valid = { labs: [80], tests: [80], project: 80 };
 
describe('calcTotalScore: валідація балів', () => {
  it.each([
    { name: 'лабораторна нижче 0', input: { ...valid, labs: [-1] } },
    { name: 'лабораторна вище 100', input: { ...valid, labs: [101] } },
    { name: 'контрольна нижче 0', input: { ...valid, tests: [-0.5] } },
    { name: 'контрольна вище 100', input: { ...valid, tests: [100.01] } },
    { name: 'проєкт нижче 0', input: { ...valid, project: -1 } },
    { name: 'проєкт вище 100', input: { ...valid, project: 101 } },
    { name: 'проєкт NaN', input: { ...valid, project: NaN } },
    { name: 'лабораторна Infinity', input: { ...valid, labs: [Infinity] } },
  ])('відхиляє: $name', ({ input }) => {
    expect(() => calcTotalScore(input)).toThrow('INVALID_SCORE');
  });
});
 
describe('calcTotalScore: порожні списки', () => {
  it.each([
    { name: 'немає лабораторних', input: { ...valid, labs: [] } },
    { name: 'немає контрольних', input: { ...valid, tests: [] } },
  ])('відхиляє: $name', ({ input }) => {
    expect(() => calcTotalScore(input)).toThrow('EMPTY_SCORES');
  });
});
 
describe('calcTotalScore: однакові бали', () => {
  it.each([0, 1, 50, 80, 99, 100])(
    'усі складові по %i → підсумок %i',
    (score) => {
      const input = { labs: [score], tests: [score], project: score };
      expect(calcTotalScore(input)).toBe(score);
    },
  );
});
 
describe('calcTotalScore: вагові коефіцієнти', () => {
  it.each([
    {
      name: 'лише лабораторні (вага 40 %)',
      input: { labs: [100], tests: [0], project: 0 },
      expected: 40,
    },
    {
      name: 'лише контрольні (вага 30 %)',
      input: { labs: [0], tests: [100], project: 0 },
      expected: 30,
    },
    {
      name: 'лише проєкт (вага 30 %)',
      input: { labs: [0], tests: [0], project: 100 },
      expected: 30,
    },
  ])('$name → $expected', ({ input, expected }) => {
    expect(calcTotalScore(input)).toBe(expected);
  });
});

describe('calcTotalScore: середнє за списками', () => {
  it('усереднює лабораторні й контрольні', () => {
    // лабораторні: (60 + 80 + 100) / 3 = 80 → 80 · 0,4 = 32
    // контрольні: (70 + 90) / 2 = 80 → 80 · 0,3 = 24
    const input = { labs: [60, 80, 100], tests: [70, 90], project: 0 };
    expect(calcTotalScore(input)).toBe(56);
  });
});
 
describe('calcTotalScore: округлення', () => {
  it('округлює підсумок до двох знаків після коми', () => {
    // 33,33·0,4 + 66,66·0,3 + 99,99·0,3 = 13,332 + 19,998 + 29,997 = 63,327
    const input = { labs: [33.33], tests: [66.66], project: 99.99 };
    expect(calcTotalScore(input)).toBe(63.33);
  });
});
 
describe('toEctsGrade: оцінки A–C', () => {
  it.each([
    { total: 100, expected: 'A' },
    { total: 90, expected: 'A' },
    { total: 89.99, expected: 'B' },
    { total: 82, expected: 'B' },
    { total: 81.99, expected: 'C' },
    { total: 74, expected: 'C' },
  ])('$total → $expected', ({ total, expected }) => {
    expect(toEctsGrade(total)).toBe(expected);
  });
});
 
describe('toEctsGrade: оцінки D–F', () => {
  it.each([
    { total: 73.99, expected: 'D' },
    { total: 64, expected: 'D' },
    { total: 63.99, expected: 'E' },
    { total: 60, expected: 'E' },
    { total: 59.99, expected: 'FX' },
    { total: 35, expected: 'FX' },
    { total: 34.99, expected: 'F' },
    { total: 0, expected: 'F' },
  ])('$total → $expected', ({ total, expected }) => {
    expect(toEctsGrade(total)).toBe(expected);
  });
});
