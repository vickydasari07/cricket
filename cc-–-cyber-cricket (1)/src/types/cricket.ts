export type PlayerRole = 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket Keeper';
export type BattingStyle = 'Right Hand' | 'Left Hand';
export type BowlingStyle =
  | 'Right-arm Fast'
  | 'Right-arm Medium'
  | 'Right-arm Off-Spin'
  | 'Right-arm Leg-Spin'
  | 'Left-arm Fast'
  | 'Left-arm Medium'
  | 'Left-arm Orthodox'
  | 'Left-arm Chinaman'
  | 'None';

export interface PlayerStats {
  matches: number;
  innings: number;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  highestScore: number;
  highestScoreNotOut: boolean;
  notOuts: number;
  thirties?: number;
  fifties: number;
  hundreds: number;
  oneFifties?: number;
  twoHundreds?: number;
  // Bowling
  wickets: number;
  ballsBowled: number;
  runsConceded: number;
  maidens: number;
  bestBowlingWickets: number;
  bestBowlingRuns: number;
  threeWickets?: number;
  fourWickets?: number;
  fiveWickets?: number;
  tenWickets?: number;
  // Fielding
  catches: number;
  runOuts: number;
  stumpings: number;
}

export interface Player {
  id: string;
  name: string;
  age: number;
  jerseyNumber: number;
  role: PlayerRole;
  battingStyle: BattingStyle;
  bowlingStyle: string;
  teamId?: string;
  teamName?: string;
  photoUrl?: string;
  avatarColor?: string;
  stats: PlayerStats;
}

export interface TeamStats {
  matches: number;
  wins: number;
  losses: number;
  ties: number;
  noResults: number;
  totalRuns: number;
  highestScore: string;
  lowestScore: string;
  totalWickets: number;
  bestBowling: string;
  winPercentage?: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoColor: string;
  logoUrl?: string;
  captainId: string;
  viceCaptainId: string;
  wicketKeeperId: string;
  playerIds: string[];
  playingXIIds?: string[];
  substituteIds?: string[];
  stats?: TeamStats;
}

export type MilestoneType =
  | '30'
  | '50'
  | '100'
  | '150'
  | '200'
  | '3w'
  | '4w'
  | '5w'
  | '10w';

export interface MatchMilestoneItem {
  id: string;
  playerId: string;
  playerName: string;
  jerseyNumber?: number;
  teamId: string;
  teamName: string;
  type: MilestoneType;
  title: string;
  tagline?: string;
  runs?: number;
  balls?: number;
  fours?: number;
  sixes?: number;
  strikeRate?: number;
  wickets?: number;
  overs?: string;
  runsConceded?: number;
  economy?: number;
  inningsNumber: 1 | 2;
  timestamp: number;
}

export type WicketType =
  | 'Bowled'
  | 'Caught'
  | 'LBW'
  | 'Run Out'
  | 'Stumped'
  | 'Hit Wicket'
  | 'Retired Out';

export interface WicketDetail {
  type: WicketType;
  dismissedPlayerId: string;
  bowlerId: string;
  fielderId?: string;
  description: string;
}

export interface ExtraDetail {
  type?: 'wide' | 'no-ball' | 'bye' | 'leg-bye' | 'penalty';
  runs: number;
}

export interface BallDelivery {
  id: string;
  inningsNumber: 1 | 2;
  overIndex: number; // 0-based over index
  ballInOver: number; // 1-6 for legal deliveries
  isLegal: boolean;
  batsmanId: string;
  nonStrikerId: string;
  bowlerId: string;
  runsOffBat: number;
  extras: ExtraDetail;
  isWicket: boolean;
  wicketDetail?: WicketDetail;
  scoreAfterBall: {
    runs: number;
    wickets: number;
    oversString: string;
  };
  commentary: string;
  timestamp: number;
}

export interface BatsmanInningsRecord {
  playerId: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  dismissalText?: string;
  dismissalType?: WicketType;
  bowlerId?: string;
  fielderId?: string;
  achievedMilestones?: MilestoneType[];
}

export interface BowlerInningsRecord {
  playerId: string;
  legalBalls: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  wides: number;
  noBalls: number;
  achievedMilestones?: MilestoneType[];
}

export interface FallOfWicket {
  wicketNumber: number;
  score: number;
  overs: string;
  playerId: string;
  playerName?: string;
}

export interface Innings {
  inningsNumber: 1 | 2;
  battingTeamId: string;
  bowlingTeamId: string;
  totalRuns: number;
  totalWickets: number;
  legalBallsBowled: number;
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    penalties: number;
    total: number;
  };
  batsmanRecords: Record<string, BatsmanInningsRecord>;
  bowlerRecords: Record<string, BowlerInningsRecord>;
  fallOfWickets: FallOfWicket[];
  deliveries: BallDelivery[];
  matchMilestones?: MatchMilestoneItem[];
  isCompleted: boolean;
}

export type MatchFormat = 'T10' | 'T20' | 'ODI' | 'Custom';
export type MatchStatus = 'setup' | 'live' | 'completed' | 'abandoned';

export interface MatchResult {
  winnerTeamId?: string;
  winType: 'runs' | 'wickets' | 'tie' | 'draw' | 'no_result';
  margin?: number;
  summaryText: string;
  playerOfTheMatchId?: string;
  playerOfTheMatchName?: string;
  playerOfTheMatchPerformance?: string;
}

export interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  matchDate: string;
  venue: string;
  format: MatchFormat;
  totalOvers: number;
  tossWinnerId: string;
  tossDecision: 'bat' | 'bowl';
  status: MatchStatus;
  currentInnings: 1 | 2;
  innings1: Innings;
  innings2?: Innings;
  currentStrikerId: string;
  currentNonStrikerId: string;
  currentBowlerId: string;
  lastBowlerId?: string;
  target?: number;
  result?: MatchResult;
  milestones?: MatchMilestoneItem[];
  createdAt: number;
  updatedAt: number;
}
