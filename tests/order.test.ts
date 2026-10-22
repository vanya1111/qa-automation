import { describe, it, expect } from 'vitest';
import {
  calcSubtotal,
  calcDiscountRate,
  calcShipping,
  calcOrderTotal,
  calcRefund,
  type OrderItem,
} from '../src/order';

const item = (price: number, qty = 1): OrderItem => ({
  sku: 'SKU-1',
  price,
  qty,
});

describe('calcSubtotal', () => {
  it('підсумовує вартість позицій з урахуванням кількості', () => {
    // Arrange
    const items = [item(100, 2), { sku: 'SKU-2', price: 50, qty: 3 }];

    // Act
    const result = calcSubtotal(items);

    // Assert
    expect(result).toBe(350);
  });

  it('приймає мінімальну кількість 1', () => {
    expect(calcSubtotal([item(100, 1)])).toBe(100);
  });

  it('приймає нульову ціну', () => {
    expect(calcSubtotal([item(0)])).toBe(0);
  });

  it('відхиляє порожнє замовлення', () => {
    expect(() => calcSubtotal([])).toThrow('EMPTY_ORDER');
  });

  it('відхиляє від’ємну ціну', () => {
    expect(() => calcSubtotal([item(-1)])).toThrow('NEGATIVE_PRICE');
  });

  it('відхиляє ціну, що менша за нуль на одну копійку', () => {
    expect(() => calcSubtotal([item(-0.01)])).toThrow('NEGATIVE_PRICE');
  });

  it.each([0, -1, 1.5])('відхиляє кількість %s', (qty) => {
    expect(() => calcSubtotal([item(100, qty)])).toThrow('INVALID_QTY');
  });
});

describe('calcDiscountRate', () => {
  it.each([
    { tier: 'basic' as const, subtotal: 500, expected: 0 },
    { tier: 'silver' as const, subtotal: 500, expected: 0.05 },
    { tier: 'gold' as const, subtotal: 500, expected: 0.1 },
    { tier: 'basic' as const, subtotal: 2000, expected: 0.05 },
    { tier: 'gold' as const, subtotal: 2000, expected: 0.15 },
  ])(
    'рівень $tier із сумою $subtotal дає ставку $expected',
    ({ tier, subtotal, expected }) => {
      expect(calcDiscountRate(tier, subtotal)).toBeCloseTo(expected, 4);
    },
  );

  it.each([
    { subtotal: 1999, expected: 0 },
    { subtotal: 2000, expected: 0.05 },
    { subtotal: 2001, expected: 0.05 },
  ])('межа великого замовлення: $subtotal', ({ subtotal, expected }) => {
    expect(calcDiscountRate('basic', subtotal)).toBeCloseTo(expected, 4);
  });

  it.each([
    { promo: 0.09, expected: 0.24 },
    { promo: 0.1, expected: 0.25 },
    { promo: 0.15, expected: 0.25 },
  ])(
    'межа максимальної знижки: промокод $promo дає ставку $expected',
    ({ promo, expected }) => {
      expect(calcDiscountRate('gold', 2000, promo)).toBeCloseTo(expected, 4);
    },
  );

  it('обмежує сумарну знижку максимальним значенням', () => {
    expect(calcDiscountRate('gold', 2000, 0.5)).toBe(0.25);
  });

  it('відхиляє від’ємний промокод', () => {
    expect(() => calcDiscountRate('basic', 500, -0.1)).toThrow('INVALID_PROMO');
  });
});

describe('calcShipping', () => {
  it.each([
    [999, 60],
    [1000, 0],
    [1001, 0],
  ])('сума %i → доставка %i', (amount, expected) => {
    expect(calcShipping(amount)).toBe(expected);
  });
});

describe('calcOrderTotal', () => {
  it('додає доставку до замовлення нижче порога', () => {
    const total = calcOrderTotal([item(500)], 'basic');
    expect(total).toBeCloseTo(560, 2);
  });

  it('не додає доставку, якщо сума після знижки сягає порога', () => {
    // 1200 − 10 % = 1080 ≥ 1000, доставка безкоштовна
    const total = calcOrderTotal([item(1200)], 'gold');
    expect(total).toBeCloseTo(1080, 2);
  });

  it('знижка може опустити суму нижче порога доставки', () => {
    // 1050 − 10 % = 945 < 1000, тому доставка платна
    const total = calcOrderTotal([item(1050)], 'gold');
    expect(total).toBeCloseTo(1005, 2);
  });

  it('доставка безкоштовна, коли сума після знижки рівно 1000', () => {
    // 1111.11 − 10 % = 999.999, після округлення 1000.00
    const total = calcOrderTotal([item(1111.11)], 'gold');
    expect(total).toBeCloseTo(1000, 2);
  });

  it('застосовує промокод до підсумкової суми', () => {
    // 1000 − (5 % + 10 %) = 850 < 1000, доставка 60
    const total = calcOrderTotal([item(1000)], 'silver', 0.1);
    expect(total).toBeCloseTo(910, 2);
  });

  it('передає виняток із нижнього рівня', () => {
    expect(() => calcOrderTotal([], 'gold')).toThrow('EMPTY_ORDER');
  });
});

describe('calcRefund (варіант 10)', () => {
  it.each([
    { days: 0, expected: 1000 },
    { days: 13, expected: 1000 },
    { days: 14, expected: 1000 },
    { days: 15, expected: 700 },
    { days: 16, expected: 700 },
    { days: 29, expected: 700 },
    { days: 30, expected: 700 },
  ])(
    'для замовлення на 1000 грн через $days дн. повертає $expected',
    ({ days, expected }) => {
      expect(calcRefund(1000, days)).toBeCloseTo(expected, 2);
    },
  );

  it('округлює часткове повернення до копійок', () => {
    // 99.99 · 0.7 = 69.993 → 69.99
    expect(calcRefund(99.99, 20)).toBeCloseTo(69.99, 2);
  });

  it('повертає 0 для нульової суми', () => {
    expect(calcRefund(0, 5)).toBe(0);
  });

  it.each([31, 32, 365])('відмовляє у поверненні через %i дн.', (days) => {
    expect(() => calcRefund(1000, days)).toThrow('REFUND_EXPIRED');
  });

  it.each([-1, 1.5, NaN])('відхиляє некоректну кількість днів %s', (days) => {
    expect(() => calcRefund(1000, days)).toThrow('INVALID_DAYS');
  });

  it.each([-1, -0.01, NaN, Infinity])(
    'відхиляє некоректну суму %s',
    (total) => {
      expect(() => calcRefund(total, 5)).toThrow('INVALID_TOTAL');
    },
  );
});
