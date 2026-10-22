/**
 * Обчислює суму простих відсотків: I = P * (r / 100) * t.
 *
 * @param principal      початкова сума (>= 0)
 * @param annualRatePct  річна ставка у відсотках (>= 0), напр. 5 означає 5 %
 * @param years          кількість років (>= 0, може бути дробовою)
 * @returns              суму відсотків, округлену до копійок (2 знаки)
 * @throws Error         INVALID_PRINCIPAL | INVALID_RATE | INVALID_YEARS
 */
export function calculateSimpleInterest(
  principal: number,
  annualRatePct: number,
  years: number,
): number {
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) {
    throw new Error('INVALID_RATE');
  }
  if (!Number.isFinite(principal) || principal < 0) {
    throw new Error('INVALID_PRINCIPAL');
  }
  if (!Number.isFinite(years) || years < 0) {
    throw new Error('INVALID_YEARS');
  }

  const interest = (principal * annualRatePct * years) / 100;
  return Math.round(interest * 100) / 100;
}
