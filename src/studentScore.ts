export interface StudentScores {
  labs: number[];
  tests: number[];
  project: number;
}
 
export const MIN_SCORE = 0;
export const MAX_SCORE = 100;
export const LABS_WEIGHT = 40;
export const TESTS_WEIGHT = 30;
export const PROJECT_WEIGHT = 30;
 
function average(list: number[]): number {
  return list.reduce((sum, value) => sum + value, 0) / list.length;
}
 
function assertValidScores(scores: StudentScores): void {
  if (scores.labs.length === 0 || scores.tests.length === 0) {
    throw new Error('EMPTY_SCORES');
  }
  const all = [...scores.labs, ...scores.tests, scores.project];
  if (all.some((s) => !Number.isFinite(s) || s < MIN_SCORE || s > MAX_SCORE)) {
    throw new Error('INVALID_SCORE');
  }
}
 
export function calcTotalScore(scores: StudentScores): number {
  assertValidScores(scores);
  const total =
    (average(scores.labs) * LABS_WEIGHT +
      average(scores.tests) * TESTS_WEIGHT +
      scores.project * PROJECT_WEIGHT) /
    100;
  return Math.round(total * 100) / 100;
}
 
export type EctsGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'FX' | 'F';
 
const ECTS_SCALE: ReadonlyArray<readonly [number, EctsGrade]> = [
  [90, 'A'],
  [82, 'B'],
  [74, 'C'],
  [64, 'D'],
  [60, 'E'],
  [35, 'FX'],
];
 
export function toEctsGrade(total: number): EctsGrade {
  for (const [min, grade] of ECTS_SCALE) {
    if (total >= min) return grade;
  }
  return 'F';
}

 
export interface StudentResult {
  total: number;
  grade: EctsGrade;
}
 
export function calcStudentResult(scores: StudentScores): StudentResult {
  const total = calcTotalScore(scores);
  return { total, grade: toEctsGrade(total) };
}
