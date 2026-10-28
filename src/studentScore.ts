export interface StudentScores {
  labs: number[];
  tests: number[];
  project: number;
}
 
export function calcTotalScore(scores: StudentScores): number {
  if (scores.labs.length === 0 || scores.tests.length === 0) {
    throw new Error('EMPTY_SCORES');
  }
  const all = [...scores.labs, ...scores.tests, scores.project];
  if (all.some((s) => !Number.isFinite(s) || s < 0 || s > 100)) {
    throw new Error('INVALID_SCORE');
  }
  return scores.project;
}
