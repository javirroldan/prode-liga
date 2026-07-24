/**
 * Scoring rules for the Argentine Liga Profesional Prode:
 * - 12 points: exact score prediction
 * - 5 points: correct winner or draw (but not exact score)
 * - 2 points: correct goals for ONE team only
 * - Never exceed 12 points per match
 */

interface MatchResult {
  homeGoals: number;
  awayGoals: number;
}

interface Prediction {
  homeGoals: number;
  awayGoals: number;
}

export function calculatePoints(prediction: Prediction, result: MatchResult): number {
  const predHome = prediction.homeGoals;
  const predAway = prediction.awayGoals;
  const resHome = result.homeGoals;
  const resAway = result.awayGoals;

  // Exact score = 12 points
  if (predHome === resHome && predAway === resAway) {
    return 12;
  }

  let points = 0;

  // Correct winner or draw = 5 points
  const predResult = getMatchResult(predHome, predAway);
  const resResult = getMatchResult(resHome, resAway);

  if (predResult === resResult) {
    points = 5;
  }

  // Correct goals for one team = 2 points
  if (predHome === resHome && predAway !== resAway) {
    points = Math.max(points, 2);
  }
  if (predAway === resAway && predHome !== resHome) {
    points = Math.max(points, 2);
  }

  // Never exceed 12
  return Math.min(points, 12);
}

function getMatchResult(homeGoals: number, awayGoals: number): "home" | "away" | "draw" {
  if (homeGoals > awayGoals) return "home";
  if (homeGoals < awayGoals) return "away";
  return "draw";
}

export function calculateAllPoints(predictions: Array<{
  prediction: Prediction;
  result: MatchResult | null;
}>): Array<{
  prediction: Prediction;
  result: MatchResult | null;
  points: number;
}> {
  return predictions.map(({ prediction, result }) => ({
    prediction,
    result,
    points: result ? calculatePoints(prediction, result) : 0,
  }));
}

export function getTotalPoints(results: Array<{ points: number }>): number {
  return results.reduce((sum, r) => sum + r.points, 0);
}

export function getPositionLabel(points: number): string {
  if (points >= 50) return "ProdeMaster";
  if (points >= 30) return "Experto";
  if (points >= 15) return "Fanático";
  if (points >= 5) return "Entusiasta";
  return "Debutante";
}
