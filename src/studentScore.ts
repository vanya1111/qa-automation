export interface StudentScores {
  labs: number[];
  tests: number[];
  project: number;
}
 
export function calcTotalScore(scores: StudentScores): number {
  if (scores.labs.length === 0 || scores.tests.length === 0) {
    throw new Error('EMPTY_SCORES');
  }
  throw new Error('INVALID_SCORE');
}
