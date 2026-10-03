import { Player, Team, Match, Innings, TeamStats } from '../types/cricket';

const STORAGE_KEYS = {
  PLAYERS: 'cc_cyber_cricket_players_v2',
  TEAMS: 'cc_cyber_cricket_teams_v2',
  MATCHES: 'cc_cyber_cricket_matches_v2',
  ACTIVE_MATCH_ID: 'cc_cyber_cricket_active_match_id_v2',
};

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'CC001',
    name: 'Rahul Kumar',
    age: 28,
    jerseyNumber: 7,
    role: 'Batsman',
    battingStyle: 'Right Hand',
    bowlingStyle: 'None',
    teamId: 'team_cw',
    teamName: 'Cyber Warriors',
    avatarColor: '#10b981',
    stats: {
      matches: 32,
      innings: 32,
      runs: 1280,
      ballsFaced: 855,
      fours: 122,
      sixes: 46,
      highestScore: 104,
      highestScoreNotOut: false,
      notOuts: 5,
      fifties: 9,
      hundreds: 1,
      wickets: 0,
      ballsBowled: 0,
      runsConceded: 0,
      maidens: 0,
      bestBowlingWickets: 0,
      bestBowlingRuns: 0,
      catches: 18,
      runOuts: 2,
      stumpings: 0,
    },
  },
  {
    id: 'CC002',
    name: 'Arjun Singh',
    age: 26,
    jerseyNumber: 18,
    role: 'All-rounder',
    battingStyle: 'Right Hand',
    bowlingStyle: 'Right-arm Fast',
    teamId: 'team_cw',
    teamName: 'Cyber Warriors',
    avatarColor: '#14b8a6',
    stats: {
      matches: 30,
      innings: 27,
      runs: 760,
      ballsFaced: 520,
      fours: 64,
      sixes: 29,
      highestScore: 68,
      highestScoreNotOut: true,
      notOuts: 7,
      fifties: 4,
      hundreds: 0,
      wickets: 34,
      ballsBowled: 640,
      runsConceded: 780,
      maidens: 4,
      bestBowlingWickets: 4,
      bestBowlingRuns: 22,
      catches: 16,
      runOuts: 4,
      stumpings: 0,
    },
  },
  {
    id: 'CC003',
    name: 'Kiran Reddy',
    age: 25,
    jerseyNumber: 45,
    role: 'Wicket Keeper',
    battingStyle: 'Right Hand',
    bowlingStyle: 'None',
    teamId: 'team_cw',
    teamName: 'Cyber Warriors',
    avatarColor: '#0d9488',
    stats: {
      matches: 28,
      innings: 24,
      runs: 540,
      ballsFaced: 375,
      fours: 44,
      sixes: 18,
      highestScore: 56,
      highestScoreNotOut: true,
      notOuts: 6,
      fifties: 2,
      hundreds: 0,
      wickets: 0,
      ballsBowled: 0,
      runsConceded: 0,
      maidens: 0,
      bestBowlingWickets: 0,
      bestBowlingRuns: 0,
      catches: 26,
      runOuts: 5,
      stumpings: 9,
    },
  },
  {
    id: 'CC004',
    name: 'Vijay Kumar',
    age: 27,
    jerseyNumber: 23,
    role: 'Bowler',
    battingStyle: 'Right Hand',
    bowlingStyle: 'Right-arm Fast',
    teamId: 'team_cw',
    teamName: 'Cyber Warriors',
    avatarColor: '#0284c7',
    stats: {
      matches: 26,
      innings: 12,
      runs: 95,
      ballsFaced: 80,
      fours: 8,
      sixes: 3,
      highestScore: 21,
      highestScoreNotOut: true,
      notOuts: 7,
      fifties: 0,
      hundreds: 0,
      wickets: 38,
      ballsBowled: 590,
      runsConceded: 710,
      maidens: 5,
      bestBowlingWickets: 4,
      bestBowlingRuns: 19,
      catches: 9,
      runOuts: 1,
      stumpings: 0,
    },
  },
  {
    id: 'CC005',
    name: 'Rohit Kumar',
    age: 27,
    jerseyNumber: 99,
    role: 'Batsman',
    battingStyle: 'Right Hand',
    bowlingStyle: 'Right-arm Off-Spin',
    teamId: 'team_cw',
    teamName: 'Cyber Warriors',
    avatarColor: '#2563eb',
    stats: {
      matches: 25,
      innings: 24,
      runs: 820,
      ballsFaced: 590,
      fours: 78,
      sixes: 31,
      highestScore: 84,
      highestScoreNotOut: false,
      notOuts: 3,
      fifties: 6,
      hundreds: 0,
      wickets: 6,
      ballsBowled: 120,
      runsConceded: 160,
      maidens: 1,
      bestBowlingWickets: 2,
      bestBowlingRuns: 18,
      catches: 11,
      runOuts: 2,
      stumpings: 0,
    },
  },
  {
    id: 'CC006',
    name: 'Naveen',
    age: 25,
    jerseyNumber: 11,
    role: 'All-rounder',
    battingStyle: 'Right Hand',
    bowlingStyle: 'Right-arm Medium',
    teamId: 'team_cw',
    teamName: 'Cyber Warriors',
    avatarColor: '#818cf8',
    stats: {
      matches: 18,
      innings: 15,
      runs: 290,
      ballsFaced: 210,
      fours: 25,
      sixes: 10,
      highestScore: 44,
      highestScoreNotOut: true,
      notOuts: 3,
      fifties: 0,
      hundreds: 0,
      wickets: 19,
      ballsBowled: 360,
      runsConceded: 450,
      maidens: 1,
      bestBowlingWickets: 3,
      bestBowlingRuns: 28,
      catches: 7,
      runOuts: 2,
      stumpings: 0,
    },
  },
  {
    id: 'CC007',
    name: 'Akhil',
    age: 24,
    jerseyNumber: 33,
    role: 'Bowler',
    battingStyle: 'Right Hand',
    bowlingStyle: 'Right-arm Fast',
    teamId: 'team_cw',
    teamName: 'Cyber Warriors',
    avatarColor: '#ec4899',
    stats: {
      matches: 12,
      innings: 6,
      runs: 30,
      ballsFaced: 28,
      fours: 2,
      sixes: 1,
      highestScore: 11,
      highestScoreNotOut: true,
      notOuts: 3,
      fifties: 0,
      hundreds: 0,
      wickets: 15,
      ballsBowled: 260,
      runsConceded: 330,
      maidens: 1,
      bestBowlingWickets: 3,
      bestBowlingRuns: 25,
      catches: 4,
      runOuts: 1,
      stumpings: 0,
    },
  },
  {
    id: 'CC008',
    name: 'Suresh',
    age: 24,
    jerseyNumber: 55,
    role: 'Batsman',
    battingStyle: 'Left Hand',
    bowlingStyle: 'Right-arm Off-Spin',
    teamId: 'team_cw',
    teamName: 'Cyber Warriors',
    avatarColor: '#38bdf8',
    stats: {
      matches: 20,
      innings: 19,
      runs: 480,
      ballsFaced: 360,
      fours: 42,
      sixes: 15,
      highestScore: 62,
      highestScoreNotOut: false,
      notOuts: 2,
      fifties: 3,
      hundreds: 0,
      wickets: 4,
      ballsBowled: 72,
      runsConceded: 98,
      maidens: 0,
      bestBowlingWickets: 2,
      bestBowlingRuns: 18,
      catches: 8,
      runOuts: 1,
      stumpings: 0,
    },
  },
  {
    id: 'CC009',
    name: 'Manoj',
    age: 26,
    jerseyNumber: 21,
    role: 'Batsman',
    battingStyle: 'Right Hand',
    bowlingStyle: 'None',
    teamId: 'team_cw',
    teamName: 'Cyber Warriors',
    avatarColor: '#a855f7',
    stats: {
      matches: 14,
      innings: 12,
      runs: 260,
      ballsFaced: 195,
      fours: 24,
      sixes: 8,
      highestScore: 48,
      highestScoreNotOut: false,
      notOuts: 1,
      fifties: 0,
      hundreds: 0,
      wickets: 0,
      ballsBowled: 0,
      runsConceded: 0,
      maidens: 0,
      bestBowlingWickets: 0,
      bestBowlingRuns: 0,
      catches: 6,
      runOuts: 1,
      stumpings: 0,
    },
  },
  {
    id: 'CC010',
    name: 'Varun',
    age: 25,
    jerseyNumber: 10,
    role: 'Bowler',
    battingStyle: 'Right Hand',
    bowlingStyle: 'Right-arm Leg-Spin',
    teamId: 'team_cw',
    teamName: 'Cyber Warriors',
    avatarColor: '#f43f5e',
    stats: {
      matches: 15,
      innings: 7,
      runs: 38,
      ballsFaced: 34,
      fours: 3,
      sixes: 1,
      highestScore: 13,
      highestScoreNotOut: false,
      notOuts: 2,
      fifties: 0,
      hundreds: 0,
      wickets: 21,
      ballsBowled: 310,
      runsConceded: 385,
      maidens: 2,
      bestBowlingWickets: 4,
      bestBowlingRuns: 26,
      catches: 5,
      runOuts: 0,
      stumpings: 0,
    },
  },
  {
    id: 'CC011',
    name: 'Ajay',
    age: 23,
    jerseyNumber: 88,
    role: 'Bowler',
    battingStyle: 'Right Hand',
    bowlingStyle: 'Left-arm Orthodox',
    teamId: 'team_cw',
    teamName: 'Cyber Warriors',
    avatarColor: '#6366f1',
    stats: {
      matches: 16,
      innings: 8,
      runs: 45,
      ballsFaced: 40,
      fours: 3,
      sixes: 1,
      highestScore: 14,
      highestScoreNotOut: true,
      notOuts: 4,
      fifties: 0,
      hundreds: 0,
      wickets: 22,
      ballsBowled: 340,
      runsConceded: 390,
      maidens: 3,
      bestBowlingWickets: 4,
      bestBowlingRuns: 20,
      catches: 5,
      runOuts: 0,
      stumpings: 0,
    },
  },
  // Cyber Kings
  {
    id: 'CC012',
    name: 'Siddharth',
    age: 29,
    jerseyNumber: 10,
    role: 'Batsman',
    battingStyle: 'Right Hand',
    bowlingStyle: 'None',
    teamId: 'team_ck',
    teamName: 'Cyber Kings',
    avatarColor: '#3b82f6',
    stats: {
      matches: 30,
      innings: 30,
      runs: 1190,
      ballsFaced: 810,
      fours: 114,
      sixes: 40,
      highestScore: 98,
      highestScoreNotOut: true,
      notOuts: 4,
      fifties: 8,
      hundreds: 0,
      wickets: 0,
      ballsBowled: 0,
      runsConceded: 0,
      maidens: 0,
      bestBowlingWickets: 0,
      bestBowlingRuns: 0,
      catches: 15,
      runOuts: 3,
      stumpings: 0,
    },
  },
  {
    id: 'CC013',
    name: 'Dev',
    age: 27,
    jerseyNumber: 33,
    role: 'All-rounder',
    battingStyle: 'Left Hand',
    bowlingStyle: 'Right-arm Medium',
    teamId: 'team_ck',
    teamName: 'Cyber Kings',
    avatarColor: '#0ea5e9',
    stats: {
      matches: 26,
      innings: 25,
      runs: 670,
      ballsFaced: 470,
      fours: 56,
      sixes: 22,
      highestScore: 64,
      highestScoreNotOut: false,
      notOuts: 3,
      fifties: 3,
      hundreds: 0,
      wickets: 24,
      ballsBowled: 480,
      runsConceded: 610,
      maidens: 2,
      bestBowlingWickets: 3,
      bestBowlingRuns: 21,
      catches: 11,
      runOuts: 2,
      stumpings: 0,
    },
  },
  {
    id: 'CC014',
    name: 'Manish',
    age: 25,
    jerseyNumber: 22,
    role: 'Wicket Keeper',
    battingStyle: 'Right Hand',
    bowlingStyle: 'None',
    teamId: 'team_ck',
    teamName: 'Cyber Kings',
    avatarColor: '#06b6d4',
    stats: {
      matches: 25,
      innings: 22,
      runs: 490,
      ballsFaced: 360,
      fours: 40,
      sixes: 14,
      highestScore: 52,
      highestScoreNotOut: true,
      notOuts: 5,
      fifties: 1,
      hundreds: 0,
      wickets: 0,
      ballsBowled: 0,
      runsConceded: 0,
      maidens: 0,
      bestBowlingWickets: 0,
      bestBowlingRuns: 0,
      catches: 22,
      runOuts: 4,
      stumpings: 7,
    },
  },
  {
    id: 'CC015',
    name: 'Vikram',
    age: 24,
    jerseyNumber: 5,
    role: 'Batsman',
    battingStyle: 'Right Hand',
    bowlingStyle: 'None',
    teamId: 'team_ck',
    teamName: 'Cyber Kings',
    avatarColor: '#0284c7',
    stats: {
      matches: 22,
      innings: 20,
      runs: 510,
      ballsFaced: 385,
      fours: 46,
      sixes: 16,
      highestScore: 58,
      highestScoreNotOut: false,
      notOuts: 2,
      fifties: 3,
      hundreds: 0,
      wickets: 0,
      ballsBowled: 0,
      runsConceded: 0,
      maidens: 0,
      bestBowlingWickets: 0,
      bestBowlingRuns: 0,
      catches: 8,
      runOuts: 1,
      stumpings: 0,
    },
  },
  {
    id: 'CC016',
    name: 'Ishan',
    age: 23,
    jerseyNumber: 32,
    role: 'Batsman',
    battingStyle: 'Left Hand',
    bowlingStyle: 'None',
    teamId: 'team_ck',
    teamName: 'Cyber Kings',
    avatarColor: '#2563eb',
    stats: {
      matches: 19,
      innings: 18,
      runs: 430,
      ballsFaced: 310,
      fours: 38,
      sixes: 17,
      highestScore: 61,
      highestScoreNotOut: false,
      notOuts: 1,
      fifties: 2,
      hundreds: 0,
      wickets: 0,
      ballsBowled: 0,
      runsConceded: 0,
      maidens: 0,
      bestBowlingWickets: 0,
      bestBowlingRuns: 0,
      catches: 7,
      runOuts: 0,
      stumpings: 0,
    },
  },
  {
    id: 'CC017',
    name: 'Hardik',
    age: 27,
    jerseyNumber: 24,
    role: 'All-rounder',
    battingStyle: 'Right Hand',
    bowlingStyle: 'Right-arm Fast',
    teamId: 'team_ck',
    teamName: 'Cyber Kings',
    avatarColor: '#4f46e5',
    stats: {
      matches: 28,
      innings: 25,
      runs: 690,
      ballsFaced: 450,
      fours: 52,
      sixes: 34,
      highestScore: 71,
      highestScoreNotOut: true,
      notOuts: 6,
      fifties: 4,
      hundreds: 0,
      wickets: 28,
      ballsBowled: 520,
      runsConceded: 670,
      maidens: 2,
      bestBowlingWickets: 4,
      bestBowlingRuns: 28,
      catches: 13,
      runOuts: 3,
      stumpings: 0,
    },
  },
  {
    id: 'CC018',
    name: 'Ravindra',
    age: 28,
    jerseyNumber: 8,
    role: 'All-rounder',
    battingStyle: 'Left Hand',
    bowlingStyle: 'Left-arm Orthodox',
    teamId: 'team_ck',
    teamName: 'Cyber Kings',
    avatarColor: '#6366f1',
    stats: {
      matches: 29,
      innings: 23,
      runs: 520,
      ballsFaced: 380,
      fours: 41,
      sixes: 19,
      highestScore: 54,
      highestScoreNotOut: true,
      notOuts: 7,
      fifties: 2,
      hundreds: 0,
      wickets: 35,
      ballsBowled: 610,
      runsConceded: 710,
      maidens: 4,
      bestBowlingWickets: 5,
      bestBowlingRuns: 18,
      catches: 21,
      runOuts: 6,
      stumpings: 0,
    },
  },
  {
    id: 'CC019',
    name: 'Jasprit',
    age: 28,
    jerseyNumber: 93,
    role: 'Bowler',
    battingStyle: 'Right Hand',
    bowlingStyle: 'Right-arm Fast',
    teamId: 'team_ck',
    teamName: 'Cyber Kings',
    avatarColor: '#7c3aed',
    stats: {
      matches: 30,
      innings: 10,
      runs: 48,
      ballsFaced: 42,
      fours: 4,
      sixes: 1,
      highestScore: 16,
      highestScoreNotOut: true,
      notOuts: 6,
      fifties: 0,
      hundreds: 0,
      wickets: 46,
      ballsBowled: 680,
      runsConceded: 740,
      maidens: 8,
      bestBowlingWickets: 5,
      bestBowlingRuns: 14,
      catches: 10,
      runOuts: 1,
      stumpings: 0,
    },
  },
  {
    id: 'CC020',
    name: 'Kuldeep',
    age: 26,
    jerseyNumber: 42,
    role: 'Bowler',
    battingStyle: 'Left Hand',
    bowlingStyle: 'Left-arm Chinaman',
    teamId: 'team_ck',
    teamName: 'Cyber Kings',
    avatarColor: '#9333ea',
    stats: {
      matches: 24,
      innings: 8,
      runs: 35,
      ballsFaced: 31,
      fours: 3,
      sixes: 0,
      highestScore: 12,
      highestScoreNotOut: true,
      notOuts: 5,
      fifties: 0,
      hundreds: 0,
      wickets: 32,
      ballsBowled: 510,
      runsConceded: 615,
      maidens: 3,
      bestBowlingWickets: 4,
      bestBowlingRuns: 22,
      catches: 6,
      runOuts: 0,
      stumpings: 0,
    },
  },
  {
    id: 'CC021',
    name: 'Mohammed',
    age: 27,
    jerseyNumber: 73,
    role: 'Bowler',
    battingStyle: 'Right Hand',
    bowlingStyle: 'Right-arm Fast',
    teamId: 'team_ck',
    teamName: 'Cyber Kings',
    avatarColor: '#c026d3',
    stats: {
      matches: 25,
      innings: 9,
      runs: 40,
      ballsFaced: 36,
      fours: 3,
      sixes: 1,
      highestScore: 15,
      highestScoreNotOut: true,
      notOuts: 4,
      fifties: 0,
      hundreds: 0,
      wickets: 36,
      ballsBowled: 560,
      runsConceded: 685,
      maidens: 4,
      bestBowlingWickets: 4,
      bestBowlingRuns: 24,
      catches: 8,
      runOuts: 1,
      stumpings: 0,
    },
  },
  {
    id: 'CC022',
    name: 'Yuzvendra',
    age: 28,
    jerseyNumber: 50,
    role: 'Bowler',
    battingStyle: 'Right Hand',
    bowlingStyle: 'Right-arm Leg-Spin',
    teamId: 'team_ck',
    teamName: 'Cyber Kings',
    avatarColor: '#e11d48',
    stats: {
      matches: 27,
      innings: 6,
      runs: 22,
      ballsFaced: 20,
      fours: 1,
      sixes: 0,
      highestScore: 8,
      highestScoreNotOut: true,
      notOuts: 4,
      fifties: 0,
      hundreds: 0,
      wickets: 37,
      ballsBowled: 580,
      runsConceded: 720,
      maidens: 3,
      bestBowlingWickets: 5,
      bestBowlingRuns: 22,
      catches: 7,
      runOuts: 1,
      stumpings: 0,
    },
  },
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team_cw',
    name: 'Cyber Warriors',
    shortName: 'CW',
    logoColor: '#10b981',
    captainId: 'CC001', // Rahul Kumar #07
    viceCaptainId: 'CC002', // Arjun Singh #18
    wicketKeeperId: 'CC003', // Kiran Reddy #45
    playerIds: [
      'CC001', // #07 Rahul Kumar
      'CC002', // #18 Arjun Singh
      'CC003', // #45 Kiran Reddy
      'CC004', // #23 Vijay Kumar
      'CC005', // #99 Rohit Kumar
      'CC006', // #11 Naveen
      'CC007', // #33 Akhil
      'CC008', // #55 Suresh
      'CC009', // #21 Manoj
      'CC010', // #10 Varun
      'CC011', // #88 Ajay
    ],
    playingXIIds: [
      'CC001',
      'CC002',
      'CC003',
      'CC004',
      'CC005',
      'CC006',
      'CC007',
      'CC008',
      'CC009',
      'CC010',
      'CC011',
    ],
    substituteIds: [],
    stats: {
      matches: 15,
      wins: 10,
      losses: 4,
      ties: 1,
      noResults: 0,
      totalRuns: 2780,
      highestScore: '214/5',
      lowestScore: '142/8',
      totalWickets: 98,
      bestBowling: '5/18',
      winPercentage: 66.7,
    },
  },
  {
    id: 'team_ck',
    name: 'Cyber Kings',
    shortName: 'CK',
    logoColor: '#3b82f6',
    captainId: 'CC012', // Siddharth #10
    viceCaptainId: 'CC013', // Dev #33
    wicketKeeperId: 'CC014', // Manish #22
    playerIds: [
      'CC012', // #10 Siddharth
      'CC013', // #33 Dev
      'CC014', // #22 Manish
      'CC015', // #05 Vikram
      'CC016', // #32 Ishan
      'CC017', // #24 Hardik
      'CC018', // #08 Ravindra
      'CC019', // #93 Jasprit
      'CC020', // #42 Kuldeep
      'CC021', // #73 Mohammed
      'CC022', // #50 Yuzvendra
    ],
    playingXIIds: [
      'CC012',
      'CC013',
      'CC014',
      'CC015',
      'CC016',
      'CC017',
      'CC018',
      'CC019',
      'CC020',
      'CC021',
      'CC022',
    ],
    substituteIds: [],
    stats: {
      matches: 14,
      wins: 8,
      losses: 5,
      ties: 1,
      noResults: 0,
      totalRuns: 2510,
      highestScore: '205/6',
      lowestScore: '135/9',
      totalWickets: 89,
      bestBowling: '5/14',
      winPercentage: 57.1,
    },
  },
  {
    id: 'team_tk',
    name: 'Thunder Kings',
    shortName: 'TK',
    logoColor: '#f59e0b',
    captainId: 'CC001',
    viceCaptainId: 'CC002',
    wicketKeeperId: 'CC003',
    playerIds: ['CC001', 'CC002', 'CC003', 'CC004', 'CC005'],
    playingXIIds: ['CC001', 'CC002', 'CC003', 'CC004', 'CC005'],
    substituteIds: [],
    stats: {
      matches: 8,
      wins: 5,
      losses: 3,
      ties: 0,
      noResults: 0,
      totalRuns: 1390,
      highestScore: '198/4',
      lowestScore: '145/8',
      totalWickets: 48,
      bestBowling: '4/21',
      winPercentage: 62.5,
    },
  },
  {
    id: 'team_as',
    name: 'ANU Strikers',
    shortName: 'AS',
    logoColor: '#8b5cf6',
    captainId: 'CC012',
    viceCaptainId: 'CC013',
    wicketKeeperId: 'CC014',
    playerIds: ['CC012', 'CC013', 'CC014', 'CC015', 'CC016'],
    playingXIIds: ['CC012', 'CC013', 'CC014', 'CC015', 'CC016'],
    substituteIds: [],
    stats: {
      matches: 6,
      wins: 4,
      losses: 2,
      ties: 0,
      noResults: 0,
      totalRuns: 1040,
      highestScore: '185/7',
      lowestScore: '132/10',
      totalWickets: 39,
      bestBowling: '4/18',
      winPercentage: 66.7,
    },
  },
  {
    id: 'team_gg',
    name: 'Guntur Giants',
    shortName: 'GG',
    logoColor: '#ec4899',
    captainId: 'CC004',
    viceCaptainId: 'CC005',
    wicketKeeperId: 'CC003',
    playerIds: ['CC004', 'CC005', 'CC006', 'CC007', 'CC008'],
    playingXIIds: ['CC004', 'CC005', 'CC006', 'CC007', 'CC008'],
    substituteIds: [],
    stats: {
      matches: 5,
      wins: 3,
      losses: 2,
      ties: 0,
      noResults: 0,
      totalRuns: 890,
      highestScore: '178/6',
      lowestScore: '140/7',
      totalWickets: 31,
      bestBowling: '4/25',
      winPercentage: 60.0,
    },
  },
];

export function buildSampleCompletedMatch(): Match {
  const cwInnings: Innings = {
    inningsNumber: 1,
    battingTeamId: 'team_cw',
    bowlingTeamId: 'team_ck',
    totalRuns: 187,
    totalWickets: 6,
    legalBallsBowled: 120,
    extras: {
      wides: 4,
      noBalls: 1,
      byes: 2,
      legByes: 2,
      penalties: 0,
      total: 9,
    },
    batsmanRecords: {
      CC001: {
        playerId: 'CC001', // #07 Rahul Kumar
        runs: 72,
        balls: 48,
        fours: 7,
        sixes: 3,
        isOut: true,
        dismissalText: 'c Manish b Jasprit',
        dismissalType: 'Caught',
        bowlerId: 'CC019',
        fielderId: 'CC014',
      },
      CC002: {
        playerId: 'CC002', // #18 Arjun Singh
        runs: 41,
        balls: 29,
        fours: 4,
        sixes: 1,
        isOut: true,
        dismissalText: 'b Mohammed',
        dismissalType: 'Bowled',
        bowlerId: 'CC021',
      },
      CC003: {
        playerId: 'CC003', // #45 Kiran Reddy
        runs: 25,
        balls: 17,
        fours: 2,
        sixes: 1,
        isOut: true,
        dismissalText: 'lbw b Kuldeep',
        dismissalType: 'LBW',
        bowlerId: 'CC020',
      },
      CC008: {
        playerId: 'CC008', // #55 Suresh
        runs: 18,
        balls: 11,
        fours: 2,
        sixes: 1,
        isOut: true,
        dismissalText: 'c Hardik b Jasprit',
        dismissalType: 'Caught',
        bowlerId: 'CC019',
        fielderId: 'CC017',
      },
      CC005: {
        playerId: 'CC005', // #99 Rohit Kumar
        runs: 14,
        balls: 9,
        fours: 1,
        sixes: 0,
        isOut: true,
        dismissalText: 'run out (Dev)',
        dismissalType: 'Run Out',
        fielderId: 'CC013',
      },
      CC006: {
        playerId: 'CC006', // #11 Naveen
        runs: 6,
        balls: 4,
        fours: 1,
        sixes: 0,
        isOut: true,
        dismissalText: 'b Mohammed',
        dismissalType: 'Bowled',
        bowlerId: 'CC021',
      },
      CC004: {
        playerId: 'CC004', // #23 Vijay Kumar
        runs: 2,
        balls: 2,
        fours: 0,
        sixes: 0,
        isOut: false,
        dismissalText: 'not out',
      },
    },
    bowlerRecords: {
      CC019: {
        playerId: 'CC019', // Jasprit
        legalBalls: 24,
        maidens: 0,
        runsConceded: 34,
        wickets: 2,
        wides: 1,
        noBalls: 0,
      },
      CC021: {
        playerId: 'CC021', // Mohammed
        legalBalls: 24,
        maidens: 0,
        runsConceded: 41,
        wickets: 2,
        wides: 1,
        noBalls: 1,
      },
      CC017: {
        playerId: 'CC017', // Hardik
        legalBalls: 24,
        maidens: 0,
        runsConceded: 39,
        wickets: 0,
        wides: 1,
        noBalls: 0,
      },
      CC020: {
        playerId: 'CC020', // Kuldeep
        legalBalls: 24,
        maidens: 0,
        runsConceded: 36,
        wickets: 1,
        wides: 0,
        noBalls: 0,
      },
      CC018: {
        playerId: 'CC018', // Ravindra
        legalBalls: 24,
        maidens: 0,
        runsConceded: 28,
        wickets: 0,
        wides: 1,
        noBalls: 0,
      },
    },
    fallOfWickets: [
      { wicketNumber: 1, score: 62, overs: '6.4', playerId: 'CC002', playerName: '#18 Arjun Singh' },
      { wicketNumber: 2, score: 124, overs: '13.2', playerId: 'CC003', playerName: '#45 Kiran Reddy' },
      { wicketNumber: 3, score: 152, overs: '16.1', playerId: 'CC001', playerName: '#07 Rahul Kumar' },
      { wicketNumber: 4, score: 168, overs: '17.5', playerId: 'CC005', playerName: '#99 Rohit Kumar' },
      { wicketNumber: 5, score: 179, overs: '18.6', playerId: 'CC008', playerName: '#55 Suresh' },
      { wicketNumber: 6, score: 185, overs: '19.4', playerId: 'CC006', playerName: '#11 Naveen' },
    ],
    deliveries: [],
    isCompleted: true,
  };

  const ckInnings: Innings = {
    inningsNumber: 2,
    battingTeamId: 'team_ck',
    bowlingTeamId: 'team_cw',
    totalRuns: 175,
    totalWickets: 8,
    legalBallsBowled: 120,
    extras: {
      wides: 5,
      noBalls: 0,
      byes: 1,
      legByes: 2,
      penalties: 0,
      total: 8,
    },
    batsmanRecords: {
      CC012: {
        playerId: 'CC012', // Siddharth
        runs: 54,
        balls: 38,
        fours: 5,
        sixes: 2,
        isOut: true,
        dismissalText: 'c Kiran Reddy b Vijay Kumar',
        dismissalType: 'Caught',
        bowlerId: 'CC004',
        fielderId: 'CC003',
      },
      CC015: {
        playerId: 'CC015', // Vikram
        runs: 22,
        balls: 17,
        fours: 3,
        sixes: 0,
        isOut: true,
        dismissalText: 'b Rohit Kumar',
        dismissalType: 'Bowled',
        bowlerId: 'CC005',
      },
      CC013: {
        playerId: 'CC013', // Dev
        runs: 38,
        balls: 26,
        fours: 4,
        sixes: 1,
        isOut: true,
        dismissalText: 'lbw b Vijay Kumar',
        dismissalType: 'LBW',
        bowlerId: 'CC004',
      },
      CC014: {
        playerId: 'CC014', // Manish
        runs: 16,
        balls: 12,
        fours: 1,
        sixes: 1,
        isOut: true,
        dismissalText: 'st Kiran Reddy b Ajay',
        dismissalType: 'Stumped',
        bowlerId: 'CC011',
        fielderId: 'CC003',
      },
      CC017: {
        playerId: 'CC017', // Hardik
        runs: 24,
        balls: 14,
        fours: 2,
        sixes: 2,
        isOut: true,
        dismissalText: 'c Arjun Singh b Naveen',
        dismissalType: 'Caught',
        bowlerId: 'CC006',
        fielderId: 'CC002',
      },
      CC018: {
        playerId: 'CC018', // Ravindra
        runs: 11,
        balls: 7,
        fours: 1,
        sixes: 0,
        isOut: true,
        dismissalText: 'run out (Rahul Kumar)',
        dismissalType: 'Run Out',
        fielderId: 'CC001',
      },
      CC016: {
        playerId: 'CC016', // Ishan
        runs: 2,
        balls: 3,
        fours: 0,
        sixes: 0,
        isOut: true,
        dismissalText: 'b Ajay',
        dismissalType: 'Bowled',
        bowlerId: 'CC011',
      },
      CC019: {
        playerId: 'CC019', // Jasprit
        runs: 0,
        balls: 1,
        fours: 0,
        sixes: 0,
        isOut: true,
        dismissalText: 'c Suresh b Naveen',
        dismissalType: 'Caught',
        bowlerId: 'CC006',
        fielderId: 'CC008',
      },
      CC020: {
        playerId: 'CC020', // Kuldeep
        runs: 0,
        balls: 2,
        fours: 0,
        sixes: 0,
        isOut: false,
        dismissalText: 'not out',
      },
    },
    bowlerRecords: {
      CC004: {
        playerId: 'CC004', // Vijay Kumar
        legalBalls: 24,
        maidens: 0,
        runsConceded: 31,
        wickets: 2,
        wides: 1,
        noBalls: 0,
      },
      CC005: {
        playerId: 'CC005', // Rohit Kumar
        legalBalls: 24,
        maidens: 0,
        runsConceded: 42,
        wickets: 1,
        wides: 2,
        noBalls: 0,
      },
      CC011: {
        playerId: 'CC011', // Ajay
        legalBalls: 24,
        maidens: 0,
        runsConceded: 29,
        wickets: 2,
        wides: 1,
        noBalls: 0,
      },
      CC006: {
        playerId: 'CC006', // Naveen
        legalBalls: 24,
        maidens: 0,
        runsConceded: 38,
        wickets: 2,
        wides: 1,
        noBalls: 0,
      },
      CC002: {
        playerId: 'CC002', // Arjun Singh
        legalBalls: 24,
        maidens: 0,
        runsConceded: 32,
        wickets: 0,
        wides: 0,
        noBalls: 0,
      },
    },
    fallOfWickets: [
      { wicketNumber: 1, score: 38, overs: '4.2', playerId: 'CC015', playerName: '#05 Vikram' },
      { wicketNumber: 2, score: 92, overs: '10.5', playerId: 'CC012', playerName: '#10 Siddharth' },
      { wicketNumber: 3, score: 118, overs: '13.3', playerId: 'CC014', playerName: '#22 Manish' },
      { wicketNumber: 4, score: 135, overs: '15.4', playerId: 'CC013', playerName: '#33 Dev' },
      { wicketNumber: 5, score: 161, overs: '18.1', playerId: 'CC017', playerName: '#24 Hardik' },
      { wicketNumber: 6, score: 167, overs: '18.5', playerId: 'CC018', playerName: '#08 Ravindra' },
      { wicketNumber: 7, score: 172, overs: '19.2', playerId: 'CC016', playerName: '#32 Ishan' },
      { wicketNumber: 8, score: 173, overs: '19.4', playerId: 'CC019', playerName: '#93 Jasprit' },
    ],
    deliveries: [],
    isCompleted: true,
  };

  return {
    id: 'match_sample_t20_001',
    teamAId: 'team_cw',
    teamBId: 'team_ck',
    matchDate: '2026-10-02',
    venue: 'Cyber Cricket Stadium',
    format: 'T20',
    totalOvers: 20,
    tossWinnerId: 'team_cw',
    tossDecision: 'bat',
    status: 'completed',
    currentInnings: 2,
    innings1: cwInnings,
    innings2: ckInnings,
    currentStrikerId: 'CC020',
    currentNonStrikerId: 'CC021',
    currentBowlerId: 'CC006',
    target: 188,
    result: {
      winnerTeamId: 'team_cw',
      winType: 'runs',
      margin: 12,
      summaryText: 'Cyber Warriors won by 12 runs',
      playerOfTheMatchId: 'CC001',
      playerOfTheMatchName: '#07 Rahul Kumar',
      playerOfTheMatchPerformance: '72 runs (48 balls, 7x4s, 3x6s)',
    },
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 82800000,
  };
}

export const StorageService = {
  getPlayers(): Player[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
        return INITIAL_PLAYERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PLAYERS;
    }
  },

  /**
   * Validate duplicate jersey numbers on the same team.
   * Allows same jersey number on different teams.
   */
  validateJerseyNumber(
    jerseyNumber: number,
    teamId?: string,
    excludePlayerId?: string
  ): { isValid: boolean; conflictingPlayerName?: string; error?: string } {
    if (isNaN(jerseyNumber) || jerseyNumber < 0 || jerseyNumber > 99) {
      return { isValid: false, error: 'Jersey number must be between 0 and 99.' };
    }

    if (!teamId) {
      return { isValid: true };
    }

    const allPlayers = this.getPlayers();
    const conflict = allPlayers.find(
      (p) =>
        p.teamId === teamId &&
        p.jerseyNumber === jerseyNumber &&
        p.id !== excludePlayerId
    );

    if (conflict) {
      return {
        isValid: false,
        conflictingPlayerName: conflict.name,
        error: `Jersey number ${jerseyNumber} is already assigned to ${conflict.name}. Please choose another number.`,
      };
    }

    return { isValid: true };
  },

  savePlayer(player: Player): void {
    const players = this.getPlayers();
    const idx = players.findIndex((p) => p.id === player.id);
    if (idx >= 0) {
      players[idx] = player;
    } else {
      players.push(player);
    }
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  },

  deletePlayer(playerId: string): void {
    const players = this.getPlayers().filter((p) => p.id !== playerId);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));

    // Also remove from any team rosters
    const teams = this.getTeams();
    let teamsUpdated = false;
    teams.forEach((t) => {
      if (t.playerIds.includes(playerId)) {
        t.playerIds = t.playerIds.filter((id) => id !== playerId);
        if (t.captainId === playerId) t.captainId = t.playerIds[0] || '';
        if (t.viceCaptainId === playerId) t.viceCaptainId = t.playerIds[1] || '';
        if (t.wicketKeeperId === playerId) t.wicketKeeperId = t.playerIds[2] || '';
        teamsUpdated = true;
      }
    });
    if (teamsUpdated) {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    }
  },

  getTeams(): Team[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
        return INITIAL_TEAMS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TEAMS;
    }
  },

  saveTeam(team: Team): void {
    const teams = this.getTeams();
    const idx = teams.findIndex((t) => t.id === team.id);
    if (idx >= 0) {
      teams[idx] = team;
    } else {
      teams.push(team);
    }
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));

    // Keep players' teamId and teamName in sync
    const players = this.getPlayers();
    let playersUpdated = false;
    players.forEach((p) => {
      if (team.playerIds.includes(p.id) && (p.teamId !== team.id || p.teamName !== team.name)) {
        p.teamId = team.id;
        p.teamName = team.name;
        playersUpdated = true;
      }
    });
    if (playersUpdated) {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    }
  },

  duplicateTeam(teamId: string): Team | null {
    const teams = this.getTeams();
    const source = teams.find((t) => t.id === teamId);
    if (!source) return null;

    const duplicated: Team = {
      ...JSON.parse(JSON.stringify(source)),
      id: `team_${Date.now()}`,
      name: `${source.name} (Copy)`,
      shortName: source.shortName ? `${source.shortName}2`.slice(0, 4) : 'CPY',
    };

    teams.push(duplicated);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    return duplicated;
  },

  getTeamStats(teamId: string): TeamStats {
    const teams = this.getTeams();
    const team = teams.find((t) => t.id === teamId);
    const matches = this.getMatches();

    let matchesPlayed = 0;
    let wins = 0;
    let losses = 0;
    let ties = 0;
    let noResults = 0;
    let totalRuns = 0;
    let totalWickets = 0;
    let maxRuns = 0;
    let maxScoreStr = '0/0';
    let minRuns = 99999;
    let minScoreStr = '-';
    let bestBowlW = 0;
    let bestBowlR = 999;

    matches.forEach((m) => {
      if (m.status !== 'completed' && m.status !== 'abandoned') return;
      const isTeamA = m.teamAId === teamId;
      const isTeamB = m.teamBId === teamId;
      if (!isTeamA && !isTeamB) return;

      matchesPlayed++;
      if (m.result) {
        if (m.result.winnerTeamId === teamId) wins++;
        else if (m.result.winType === 'tie') ties++;
        else if (m.result.winType === 'no_result') noResults++;
        else losses++;
      }

      // Check runs scored by this team in innings
      const scanInnings = (inn?: Innings) => {
        if (!inn) return;
        if (inn.battingTeamId === teamId) {
          totalRuns += inn.totalRuns;
          if (inn.totalRuns > maxRuns) {
            maxRuns = inn.totalRuns;
            maxScoreStr = `${inn.totalRuns}/${inn.totalWickets}`;
          }
          if (inn.totalRuns < minRuns && inn.totalRuns > 0) {
            minRuns = inn.totalRuns;
            minScoreStr = `${inn.totalRuns}/${inn.totalWickets}`;
          }
        }
        if (inn.bowlingTeamId === teamId) {
          totalWickets += inn.totalWickets;
          Object.values(inn.bowlerRecords).forEach((bw) => {
            if (
              bw.wickets > bestBowlW ||
              (bw.wickets === bestBowlW && bw.runsConceded < bestBowlR && bw.wickets > 0)
            ) {
              bestBowlW = bw.wickets;
              bestBowlR = bw.runsConceded;
            }
          });
        }
      };

      scanInnings(m.innings1);
      scanInnings(m.innings2);
    });

    // If matches played exist, prioritize dynamic calculations
    if (matchesPlayed > 0) {
      const bestBowlingStr = bestBowlW > 0 ? `${bestBowlW}/${bestBowlR}` : team?.stats?.bestBowling || '0/0';
      return {
        matches: matchesPlayed,
        wins,
        losses,
        ties,
        noResults,
        totalRuns,
        highestScore: maxScoreStr,
        lowestScore: minScoreStr !== '-' ? minScoreStr : '0/0',
        totalWickets,
        bestBowling: bestBowlingStr,
        winPercentage: matchesPlayed > 0 ? Number(((wins / matchesPlayed) * 100).toFixed(1)) : 0,
      };
    }

    // Default to stored team stats if available or template
    if (team?.stats) {
      return team.stats;
    }

    return {
      matches: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      noResults: 0,
      totalRuns: 0,
      highestScore: '0/0',
      lowestScore: '0/0',
      totalWickets: 0,
      bestBowling: '0/0',
      winPercentage: 0,
    };
  },

  deleteTeam(teamId: string): void {
    const teams = this.getTeams().filter((t) => t.id !== teamId);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));

    // Unassign players from deleted team
    const players = this.getPlayers();
    let playersUpdated = false;
    players.forEach((p) => {
      if (p.teamId === teamId) {
        delete p.teamId;
        delete p.teamName;
        playersUpdated = true;
      }
    });
    if (playersUpdated) {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    }
  },

  getMatches(): Match[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
      if (!data) {
        const sample = buildSampleCompletedMatch();
        localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([sample]));
        return [sample];
      }
      return JSON.parse(data);
    } catch {
      return [buildSampleCompletedMatch()];
    }
  },

  getMatchById(id: string): Match | undefined {
    return this.getMatches().find((m) => m.id === id);
  },

  saveMatch(match: Match): void {
    const matches = this.getMatches();
    const idx = matches.findIndex((m) => m.id === match.id);
    if (idx >= 0) {
      matches[idx] = { ...match, updatedAt: Date.now() };
    } else {
      matches.unshift({ ...match, updatedAt: Date.now() });
    }
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  },

  deleteMatch(matchId: string): void {
    const matches = this.getMatches().filter((m) => m.id !== matchId);
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    if (this.getActiveMatchId() === matchId) {
      this.clearActiveMatchId();
    }
  },

  getActiveMatchId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_MATCH_ID);
  },

  setActiveMatchId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MATCH_ID, id);
  },

  clearActiveMatchId(): void {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_MATCH_ID);
  },

  resetToSampleData(): void {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
    const sample = buildSampleCompletedMatch();
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([sample]));
    this.clearActiveMatchId();
  },

  exportAllData(): string {
    const data = {
      players: this.getPlayers(),
      teams: this.getTeams(),
      matches: this.getMatches(),
      exportedAt: new Date().toISOString(),
      app: 'CC - Cyber Cricket',
    };
    return JSON.stringify(data, null, 2);
  },

  importAllData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.players)) {
        localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(parsed.players));
      }
      if (Array.isArray(parsed.teams)) {
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(parsed.teams));
      }
      if (Array.isArray(parsed.matches)) {
        localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(parsed.matches));
      }
      return true;
    } catch {
      return false;
    }
  },
};
