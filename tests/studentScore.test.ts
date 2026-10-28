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
