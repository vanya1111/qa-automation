import { describe, it, expect } from 'vitest';
import { calcTotalScore } from '../src/studentScore';
 
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
