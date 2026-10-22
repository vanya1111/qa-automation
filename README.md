# Лабораторна робота № 1. Розгортання середовища автоматизації тестування

**Дисципліна:** Автоматизація тестування
**Виконавець:** ПРІЗВИЩЕ ІМ'Я, група XX-XX
**Варіант:** 10 — обчислення простих відсотків; відхилення від’ємної ставки

## Структура проєкту

```
qa-automation/
├── src/
│   ├── temperature.ts       # показовий приклад (°C → °F)
│   ├── order.ts             # ЛР2: розрахунок замовлення + calcRefund (варіант 10)
│   └── simpleInterest.ts    # модуль за варіантом 10
├── tests/
│   ├── temperature.test.ts
│   ├── order.test.ts        # ЛР2
│   └── simpleInterest.test.ts
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Встановлення та запуск

Потрібні Node.js 20+ та npm.

```bash
npm install          # встановити залежності
npm test             # одноразовий прогін тестів
npm run test:watch   # режим спостереження
npm run coverage     # тести + покриття (звіт у coverage/index.html)
npm run lint         # статичний аналіз
npm run format       # форматування Prettier
```

## Варіант 10

`calculateSimpleInterest(principal, annualRatePct, years)` повертає суму
простих відсотків `I = P · r/100 · t`, округлену до 2 знаків.
Некоректні дані призводять до винятку: `INVALID_RATE` (від’ємна або нечислова
ставка), `INVALID_PRINCIPAL`, `INVALID_YEARS`.

## Лабораторна робота № 2. Модульне тестування (варіант 10)

`calcRefund(total, daysSincePurchase)` у `src/order.ts`:

| Днів після покупки | Результат                         |
| ------------------ | --------------------------------- |
| 0–14               | 100 % суми                        |
| 15–30              | 70 % суми (округлення до копійок) |
| понад 30           | виняток `REFUND_EXPIRED`          |

Інші винятки: `INVALID_TOTAL` (від’ємна, нечислова або нескінченна сума),
`INVALID_DAYS` (від’ємна, дробова або нечислова кількість днів).

Пороги покриття (`vitest.config.ts`): рядки ≥ 80 %, гілки ≥ 90 %, функції 100 %.
