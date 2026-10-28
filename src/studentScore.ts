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
  const labsAvg = scores.labs.reduce((sum, v) => sum + v, 0) / scores.labs.length;
  const testsAvg = scores.tests.reduce((sum, v) => sum + v, 0) / scores.tests.length;
  return (labsAvg * 40 + testsAvg * 30 + scores.project * 30) / 100;
}
