import { Innings, Match } from '../types/cricket';

/**
 * Format a jersey number to clean 2-digit representation (0-99)
 * e.g., 7 -> "#07", 18 -> "#18", 0 -> "#00"
 */
export function formatJersey(jerseyNumber?: number | null): string {
  if (jerseyNumber === undefined || jerseyNumber === null || isNaN(Number(jerseyNumber))) {
    return '#--';
  }
  const num = Math.max(0, Math.min(99, Math.floor(Number(jerseyNumber))));
  return `#${num.toString().padStart(2, '0')}`;
}

/**
 * Format player display with distinct jersey number and name
 * e.g., "#07 Rahul Kumar"
 */
export function formatPlayerDisplay(player?: { name: string; jerseyNumber?: number } | null): string {
  if (!player) return 'Unknown Player';
  return `${formatJersey(player.jerseyNumber)} ${player.name}`;
}

/**
 * Convert count of legal balls to cricket overs string notation.
 * e.g., 94 balls -> "15.4" (15 completed overs, 4 balls)
 */
export function ballsToOversString(balls: number): string {
  if (balls <= 0) return '0.0';
  const completedOvers = Math.floor(balls / 6);
  const remainderBalls = balls % 6;
  return `${completedOvers}.${remainderBalls}`;
}

/**
 * Convert count of legal balls to actual decimal overs for rate calculations.
 * e.g., 94 balls -> 15 + 4/6 = 15.6667
 */
export function ballsToDecimalOvers(balls: number): number {
  if (balls <= 0) return 0;
  return Math.floor(balls / 6) + (balls % 6) / 6;
}

/**
 * Calculate strike rate: (Runs / Balls) * 100
 */
export function calculateStrikeRate(runs: number, balls: number): number {
  if (balls <= 0) return 0;
  return Number(((runs / balls) * 100).toFixed(2));
}

/**
 * Calculate bowler's economy: Runs Conceded / Overs
 */
export function calculateEconomy(runsConceded: number, legalBalls: number): number {
  const overs = ballsToDecimalOvers(legalBalls);
  if (overs <= 0) return 0;
  return Number((runsConceded / overs).toFixed(2));
}

/**
 * Calculate current run rate: Total Runs / Overs
 */
export function calculateRunRate(totalRuns: number, legalBalls: number): number {
  const overs = ballsToDecimalOvers(legalBalls);
  if (overs <= 0) return 0;
  return Number((totalRuns / overs).toFixed(2));
}

/**
 * Calculate required run rate for a chase:
 * Required Runs / Remaining Overs
 */
export function calculateRequiredRunRate(
  target: number,
  currentRuns: number,
  totalOvers: number,
  currentLegalBalls: number
): { requiredRuns: number; remainingBalls: number; requiredRunRate: number } {
  const requiredRuns = Math.max(0, target - currentRuns);
  const maxBalls = totalOvers * 6;
  const remainingBalls = Math.max(0, maxBalls - currentLegalBalls);
  const remainingOvers = ballsToDecimalOvers(remainingBalls);

  if (remainingBalls <= 0) {
    return { requiredRuns, remainingBalls: 0, requiredRunRate: requiredRuns > 0 ? 99.99 : 0 };
  }

  const rrr = Number((requiredRuns / remainingOvers).toFixed(2));
  return {
    requiredRuns,
    remainingBalls,
    requiredRunRate: rrr,
  };
}

/**
 * Evaluates the Player of the Match based on batting, bowling, and fielding points.
 */
export function evaluatePlayerOfTheMatch(
  match: Match,
  getPlayerName: (id: string) => string
): { playerId: string; name: string; performanceText: string } | null {
  const pointsMap = new Map<string, { runs: number; wickets: number; totalPoints: number; text: string }>();

  const processInnings = (inn: Innings) => {
    // Batting
    Object.values(inn.batsmanRecords).forEach((bat) => {
      let pts = bat.runs;
      pts += bat.fours * 1;
      pts += bat.sixes * 2;
      if (bat.runs >= 100) pts += 25;
      else if (bat.runs >= 50) pts += 15;
      if (bat.balls >= 10 && bat.runs / bat.balls > 1.5) pts += 5;

      const existing = pointsMap.get(bat.playerId) || { runs: 0, wickets: 0, totalPoints: 0, text: '' };
      existing.runs += bat.runs;
      existing.totalPoints += pts;
      pointsMap.set(bat.playerId, existing);
    });

    // Bowling
    Object.values(inn.bowlerRecords).forEach((bowl) => {
      let pts = bowl.wickets * 25;
      pts += bowl.maidens * 12;
      const overs = ballsToDecimalOvers(bowl.legalBalls);
      if (overs >= 2) {
        const econ = bowl.runsConceded / overs;
        if (econ < 6) pts += 10;
        else if (econ > 10) pts -= 5;
      }
      if (bowl.wickets >= 5) pts += 25;
      else if (bowl.wickets >= 3) pts += 15;

      const existing = pointsMap.get(bowl.playerId) || { runs: 0, wickets: 0, totalPoints: 0, text: '' };
      existing.wickets += bowl.wickets;
      existing.totalPoints += pts;
      pointsMap.set(bowl.playerId, existing);
    });
  };

  processInnings(match.innings1);
  if (match.innings2) {
    processInnings(match.innings2);
  }

  let topPlayerId = '';
  let maxPts = -999;
  pointsMap.forEach((val, id) => {
    if (val.totalPoints > maxPts) {
      maxPts = val.totalPoints;
      topPlayerId = id;
    }
  });

  if (!topPlayerId) return null;

  const top = pointsMap.get(topPlayerId)!;
  const name = getPlayerName(topPlayerId);
  const parts: string[] = [];
  if (top.runs > 0) parts.push(`${top.runs} runs`);
  if (top.wickets > 0) parts.push(`${top.wickets} wickets`);
  const performanceText = parts.length > 0 ? parts.join(' & ') : `${top.totalPoints} performance points`;

  return {
    playerId: topPlayerId,
    name,
    performanceText,
  };
}
