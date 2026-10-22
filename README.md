# Лабораторна робота № 1. Розгортання середовища автоматизації тестування

**Дисципліна:** Автоматизація тестування
**Виконавець:** ПРІЗВИЩЕ ІМ'Я, група XX-XX
**Варіант:** 10 — обчислення простих відсотків; відхилення від’ємної ставки

## Структура проєкту

```
qa-automation/
├── src/
│   ├── temperature.ts       # показовий приклад (°C → °F)
│   └── simpleInterest.ts    # модуль за варіантом 10
├── tests/
│   ├── temperature.test.ts
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
