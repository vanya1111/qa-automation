import { describe, it, expect } from 'vitest';
import { calculateSimpleInterest } from '../src/simpleInterest';

describe('calculateSimpleInterest', () => {
  describe('коректні дані', () => {
    it('обчислює 100 для суми 1000, ставки 5 % і терміну 2 роки', () => {
      // Arrange
      const principal = 1000;
      const rate = 5;
      const years = 2;

      // Act
      const result = calculateSimpleInterest(principal, rate, years);

      // Assert
      expect(result).toBe(100);
    });

    it('округлює результат до двох знаків після коми', () => {
      expect(calculateSimpleInterest(2500.5, 7.5, 3)).toBeCloseTo(562.61, 2);
    });

    it('підтримує дробову кількість років', () => {
      expect(calculateSimpleInterest(2000, 10, 0.5)).toBe(100);
    });
  });

  describe('межові значення', () => {
    it('повертає 0 при нульовій ставці', () => {
      expect(calculateSimpleInterest(1000, 0, 5)).toBe(0);
    });

    it('повертає 0 при нульовій сумі', () => {
      expect(calculateSimpleInterest(0, 5, 5)).toBe(0);
    });

    it('повертає 0 при нульовому терміні', () => {
      expect(calculateSimpleInterest(1000, 5, 0)).toBe(0);
    });
  });

  describe('некоректні дані', () => {
    it('відхиляє від’ємну ставку', () => {
      expect(() => calculateSimpleInterest(1000, -1, 2)).toThrow(
        'INVALID_RATE',
      );
    });

    it('відхиляє нечислову ставку', () => {
      expect(() => calculateSimpleInterest(1000, NaN, 2)).toThrow(
        'INVALID_RATE',
      );
    });

    it('відхиляє від’ємну суму', () => {
      expect(() => calculateSimpleInterest(-1000, 5, 2)).toThrow(
        'INVALID_PRINCIPAL',
      );
    });

    it('відхиляє від’ємну кількість років', () => {
      expect(() => calculateSimpleInterest(1000, 5, -2)).toThrow(
        'INVALID_YEARS',
      );
    });
  });
});
