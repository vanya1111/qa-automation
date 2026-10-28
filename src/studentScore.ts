export interface StudentScores {
  labs: number[];
  tests: number[];
  project: number;
}
 
export function calcTotalScore(scores: StudentScores): number {
  throw new Error('INVALID_SCORE');
}
