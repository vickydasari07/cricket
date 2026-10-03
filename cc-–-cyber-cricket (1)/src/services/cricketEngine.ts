import {
  Match,
  Innings,
  BallDelivery,
  WicketType,
  WicketDetail,
  Team,
  Player,
  MatchMilestoneItem,
} from '../types/cricket';
import { ballsToOversString, evaluatePlayerOfTheMatch } from '../utils/cricketMath';

export interface ScoreDeliveryInput {
  runsOffBat: number;
  extrasType?: 'wide' | 'no-ball' | 'bye' | 'leg-bye' | 'penalty';
  extrasRuns?: number;
  isWicket: boolean;
  wicketType?: WicketType;
  dismissedPlayerId?: string;
  fielderId?: string;
  incomingBatsmanId?: string;
  nextBowlerId?: string;
  commentary?: string;
}

export const CricketEngine = {
  /**
   * Helper to get current active innings from a match
   */
  getActiveInnings(match: Match): Innings {
    return match.currentInnings === 1 ? match.innings1 : match.innings2!;
  },

  /**
   * Processes a single ball delivery and returns updated Match object
   */
  processDelivery(
    match: Match,
    input: ScoreDeliveryInput,
    battingTeam: Team,
    getPlayerName: (id: string) => string,
    bowlingTeam?: Team,
    getPlayer?: (id: string) => Player | undefined
  ): {
    updatedMatch: Match;
    requiresNewBatsman: boolean;
    requiresNewBowler: boolean;
    isInningsEnded: boolean;
    isMatchEnded: boolean;
    newMilestone?: MatchMilestoneItem;
  } {
    // Clone match state deeply to avoid mutation bugs
    const updated: Match = JSON.parse(JSON.stringify(match));
    const innings = updated.currentInnings === 1 ? updated.innings1 : updated.innings2!;

    const currentStrikerId = updated.currentStrikerId;
    const currentNonStrikerId = updated.currentNonStrikerId;
    const currentBowlerId = updated.currentBowlerId;

    // Ensure batsman & bowler records exist in this innings
    if (!innings.batsmanRecords[currentStrikerId]) {
      innings.batsmanRecords[currentStrikerId] = {
        playerId: currentStrikerId,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
        achievedMilestones: [],
      };
    }
    if (!innings.batsmanRecords[currentNonStrikerId]) {
      innings.batsmanRecords[currentNonStrikerId] = {
        playerId: currentNonStrikerId,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
        achievedMilestones: [],
      };
    }
    if (!innings.bowlerRecords[currentBowlerId]) {
      innings.bowlerRecords[currentBowlerId] = {
        playerId: currentBowlerId,
        legalBalls: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
        wides: 0,
        noBalls: 0,
        achievedMilestones: [],
      };
    }

    const strikerRecord = innings.batsmanRecords[currentStrikerId];
    const bowlerRecord = innings.bowlerRecords[currentBowlerId];

    strikerRecord.achievedMilestones = strikerRecord.achievedMilestones || [];
    bowlerRecord.achievedMilestones = bowlerRecord.achievedMilestones || [];
    innings.matchMilestones = innings.matchMilestones || [];
    updated.milestones = updated.milestones || [];

    // Capture previous numbers to detect crossings accurately
    const prevStrikerRuns = strikerRecord.runs;
    const prevBowlerWickets = bowlerRecord.wickets;

    // Determine legality of ball
    const isWide = input.extrasType === 'wide';
    const isNoBall = input.extrasType === 'no-ball';
    const isBye = input.extrasType === 'bye';
    const isLegBye = input.extrasType === 'leg-bye';
    const isPenalty = input.extrasType === 'penalty';
    const isLegal = !isWide && !isNoBall && !isPenalty;

    const runsOffBat = input.runsOffBat || 0;
    const extrasRuns = input.extrasRuns || 0;

    let ballRunsChargedToBowler = 0;
    let ballRunsToBattingTeam = 0;

    if (isWide) {
      // Wide adds at least 1 extra plus any extra running runs
      const totalWideRuns = extrasRuns > 0 ? extrasRuns : 1;
      innings.extras.wides += totalWideRuns;
      innings.extras.total += totalWideRuns;
      bowlerRecord.wides += 1;
      ballRunsChargedToBowler += totalWideRuns;
      ballRunsToBattingTeam += totalWideRuns;
      // Batsman does not face a legal delivery
    } else if (isNoBall) {
      // No ball adds 1 extra plus runs off bat
      const nbExtra = 1;
      innings.extras.noBalls += nbExtra;
      innings.extras.total += nbExtra;
      bowlerRecord.noBalls += 1;
      ballRunsChargedToBowler += nbExtra + runsOffBat;
      ballRunsToBattingTeam += nbExtra + runsOffBat;

      strikerRecord.runs += runsOffBat;
      strikerRecord.balls += 1;
      if (runsOffBat === 4) strikerRecord.fours += 1;
      if (runsOffBat === 6) strikerRecord.sixes += 1;
    } else if (isBye) {
      innings.extras.byes += extrasRuns;
      innings.extras.total += extrasRuns;
      ballRunsToBattingTeam += extrasRuns;
      // Batsman faced a ball
      strikerRecord.balls += 1;
      // Bowler is NOT charged with byes in cricket rules
    } else if (isLegBye) {
      innings.extras.legByes += extrasRuns;
      innings.extras.total += extrasRuns;
      ballRunsToBattingTeam += extrasRuns;
      strikerRecord.balls += 1;
      // Bowler is NOT charged with leg byes in cricket rules
    } else if (isPenalty) {
      innings.extras.penalties += extrasRuns;
      innings.extras.total += extrasRuns;
      ballRunsToBattingTeam += extrasRuns;
    } else {
      // Normal legal delivery off bat
      strikerRecord.runs += runsOffBat;
      strikerRecord.balls += 1;
      if (runsOffBat === 4) strikerRecord.fours += 1;
      if (runsOffBat === 6) strikerRecord.sixes += 1;

      ballRunsChargedToBowler += runsOffBat;
      ballRunsToBattingTeam += runsOffBat;
    }

    bowlerRecord.runsConceded += ballRunsChargedToBowler;
    innings.totalRuns += ballRunsToBattingTeam;

    if (isLegal) {
      innings.legalBallsBowled += 1;
      bowlerRecord.legalBalls += 1;
    }

    // Wicket processing
    let wicketDetail: WicketDetail | undefined = undefined;
    let dismissedPlayerId = input.dismissedPlayerId || currentStrikerId;

    if (input.isWicket && input.wicketType) {
      innings.totalWickets += 1;
      const bowlerWicket = ['Bowled', 'Caught', 'LBW', 'Stumped', 'Hit Wicket'].includes(input.wicketType);
      if (bowlerWicket) {
        bowlerRecord.wickets += 1;
      }

      const bowlerName = getPlayerName(currentBowlerId);
      const fielderName = input.fielderId ? getPlayerName(input.fielderId) : '';
      let desc = '';
      if (input.wicketType === 'Bowled') desc = `b ${bowlerName}`;
      else if (input.wicketType === 'Caught') desc = `c ${fielderName || 'Fielder'} b ${bowlerName}`;
      else if (input.wicketType === 'LBW') desc = `lbw b ${bowlerName}`;
      else if (input.wicketType === 'Run Out') desc = `run out (${fielderName || 'Fielder'})`;
      else if (input.wicketType === 'Stumped') desc = `st ${fielderName || 'Keeper'} b ${bowlerName}`;
      else if (input.wicketType === 'Hit Wicket') desc = `hit wicket b ${bowlerName}`;
      else if (input.wicketType === 'Retired Out') desc = `retired out`;

      wicketDetail = {
        type: input.wicketType,
        dismissedPlayerId,
        bowlerId: currentBowlerId,
        fielderId: input.fielderId,
        description: desc,
      };

      const outBatsman = innings.batsmanRecords[dismissedPlayerId];
      if (outBatsman) {
        outBatsman.isOut = true;
        outBatsman.dismissalType = input.wicketType;
        outBatsman.dismissalText = desc;
        outBatsman.bowlerId = currentBowlerId;
        outBatsman.fielderId = input.fielderId;
      }

      innings.fallOfWickets.push({
        wicketNumber: innings.totalWickets,
        score: innings.totalRuns,
        overs: ballsToOversString(innings.legalBallsBowled),
        playerId: dismissedPlayerId,
        playerName: getPlayerName(dismissedPlayerId),
      });

      // If incoming batsman provided right away
      if (input.incomingBatsmanId) {
        if (dismissedPlayerId === updated.currentStrikerId) {
          updated.currentStrikerId = input.incomingBatsmanId;
        } else {
          updated.currentNonStrikerId = input.incomingBatsmanId;
        }
        if (!innings.batsmanRecords[input.incomingBatsmanId]) {
          innings.batsmanRecords[input.incomingBatsmanId] = {
            playerId: input.incomingBatsmanId,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            isOut: false,
            achievedMilestones: [],
          };
        }
      }
    }

    // --- AUTOMATIC PLAYER MILESTONE DETECTION SYSTEM ---
    const newStrikerRuns = strikerRecord.runs;
    const newBowlerWickets = bowlerRecord.wickets;
    let triggeredMilestone: MatchMilestoneItem | undefined = undefined;

    const strikerName = getPlayerName(currentStrikerId);
    const strikerSr = strikerRecord.balls > 0 ? Number(((strikerRecord.runs / strikerRecord.balls) * 100).toFixed(2)) : 0;

    const strikerPlayer = getPlayer ? getPlayer(currentStrikerId) : undefined;
    const strikerJersey = strikerPlayer?.jerseyNumber;
    const bowlerPlayer = getPlayer ? getPlayer(currentBowlerId) : undefined;
    const bowlerJersey = bowlerPlayer?.jerseyNumber;

    // Batting Milestones: 200, 150, 100, 50, 30
    // Strictly triggers only ONCE when reached or crossed
    if (!strikerRecord.achievedMilestones.includes('200') && prevStrikerRuns < 200 && newStrikerRuns >= 200) {
      strikerRecord.achievedMilestones.push('200');
      triggeredMilestone = {
        id: `ms_${Date.now()}_200`,
        playerId: currentStrikerId,
        playerName: strikerName,
        jerseyNumber: strikerJersey,
        teamId: battingTeam.id,
        teamName: battingTeam.name,
        type: '200',
        title: 'DOUBLE CENTURY!',
        tagline: 'HISTORIC 200!',
        runs: strikerRecord.runs,
        balls: strikerRecord.balls,
        fours: strikerRecord.fours,
        sixes: strikerRecord.sixes,
        strikeRate: strikerSr,
        inningsNumber: updated.currentInnings,
        timestamp: Date.now(),
      };
    } else if (!strikerRecord.achievedMilestones.includes('150') && prevStrikerRuns < 150 && newStrikerRuns >= 150) {
      strikerRecord.achievedMilestones.push('150');
      triggeredMilestone = {
        id: `ms_${Date.now()}_150`,
        playerId: currentStrikerId,
        playerName: strikerName,
        jerseyNumber: strikerJersey,
        teamId: battingTeam.id,
        teamName: battingTeam.name,
        type: '150',
        title: '150 RUNS!',
        tagline: 'MAGNIFICENT 150!',
        runs: strikerRecord.runs,
        balls: strikerRecord.balls,
        fours: strikerRecord.fours,
        sixes: strikerRecord.sixes,
        strikeRate: strikerSr,
        inningsNumber: updated.currentInnings,
        timestamp: Date.now(),
      };
    } else if (!strikerRecord.achievedMilestones.includes('100') && prevStrikerRuns < 100 && newStrikerRuns >= 100) {
      strikerRecord.achievedMilestones.push('100');
      triggeredMilestone = {
        id: `ms_${Date.now()}_100`,
        playerId: currentStrikerId,
        playerName: strikerName,
        jerseyNumber: strikerJersey,
        teamId: battingTeam.id,
        teamName: battingTeam.name,
        type: '100',
        title: '100 RUNS!',
        tagline: 'MASTERCLASS INNINGS!',
        runs: strikerRecord.runs,
        balls: strikerRecord.balls,
        fours: strikerRecord.fours,
        sixes: strikerRecord.sixes,
        strikeRate: strikerSr,
        inningsNumber: updated.currentInnings,
        timestamp: Date.now(),
      };
    } else if (!strikerRecord.achievedMilestones.includes('50') && prevStrikerRuns < 50 && newStrikerRuns >= 50) {
      strikerRecord.achievedMilestones.push('50');
      triggeredMilestone = {
        id: `ms_${Date.now()}_50`,
        playerId: currentStrikerId,
        playerName: strikerName,
        jerseyNumber: strikerJersey,
        teamId: battingTeam.id,
        teamName: battingTeam.name,
        type: '50',
        title: '50 RUNS!',
        tagline: 'Bat Raised!',
        runs: strikerRecord.runs,
        balls: strikerRecord.balls,
        fours: strikerRecord.fours,
        sixes: strikerRecord.sixes,
        strikeRate: strikerSr,
        inningsNumber: updated.currentInnings,
        timestamp: Date.now(),
      };
    } else if (!strikerRecord.achievedMilestones.includes('30') && prevStrikerRuns < 30 && newStrikerRuns >= 30) {
      strikerRecord.achievedMilestones.push('30');
      triggeredMilestone = {
        id: `ms_${Date.now()}_30`,
        playerId: currentStrikerId,
        playerName: strikerName,
        jerseyNumber: strikerJersey,
        teamId: battingTeam.id,
        teamName: battingTeam.name,
        type: '30',
        title: '30 RUNS!',
        tagline: 'MILESTONE!',
        runs: strikerRecord.runs,
        balls: strikerRecord.balls,
        fours: strikerRecord.fours,
        sixes: strikerRecord.sixes,
        strikeRate: strikerSr,
        inningsNumber: updated.currentInnings,
        timestamp: Date.now(),
      };
    }

    // Bowling Milestones: 10w, 5w, 4w, 3w
    const bowlerName = getPlayerName(currentBowlerId);
    const bowlerEcon = bowlerRecord.legalBalls > 0 ? Number((bowlerRecord.runsConceded / (bowlerRecord.legalBalls / 6)).toFixed(2)) : 0;
    const bowlerOvers = ballsToOversString(bowlerRecord.legalBalls);
    const resolvedBowlingTeamName = bowlingTeam?.name || (updated.currentInnings === 1 ? 'Bowling Team' : 'Batting Team');
    const bowlingTeamId = bowlingTeam?.id || (updated.currentInnings === 1 ? updated.teamBId : updated.teamAId);

    if (!bowlerRecord.achievedMilestones.includes('10w') && prevBowlerWickets < 10 && newBowlerWickets >= 10) {
      bowlerRecord.achievedMilestones.push('10w');
      triggeredMilestone = {
        id: `ms_${Date.now()}_10w`,
        playerId: currentBowlerId,
        playerName: bowlerName,
        jerseyNumber: bowlerJersey,
        teamId: bowlingTeamId,
        teamName: resolvedBowlingTeamName,
        type: '10w',
        title: '10 WICKETS IN A MATCH!',
        tagline: 'LEGENDARY!',
        wickets: bowlerRecord.wickets,
        overs: bowlerOvers,
        runsConceded: bowlerRecord.runsConceded,
        economy: bowlerEcon,
        inningsNumber: updated.currentInnings,
        timestamp: Date.now(),
      };
    } else if (!bowlerRecord.achievedMilestones.includes('5w') && prevBowlerWickets < 5 && newBowlerWickets >= 5) {
      bowlerRecord.achievedMilestones.push('5w');
      triggeredMilestone = {
        id: `ms_${Date.now()}_5w`,
        playerId: currentBowlerId,
        playerName: bowlerName,
        jerseyNumber: bowlerJersey,
        teamId: bowlingTeamId,
        teamName: resolvedBowlingTeamName,
        type: '5w',
        title: '5-WICKET HAUL!',
        tagline: 'Sensational spell!',
        wickets: bowlerRecord.wickets,
        overs: bowlerOvers,
        runsConceded: bowlerRecord.runsConceded,
        economy: bowlerEcon,
        inningsNumber: updated.currentInnings,
        timestamp: Date.now(),
      };
    } else if (!bowlerRecord.achievedMilestones.includes('4w') && prevBowlerWickets < 4 && newBowlerWickets >= 4) {
      bowlerRecord.achievedMilestones.push('4w');
      triggeredMilestone = {
        id: `ms_${Date.now()}_4w`,
        playerId: currentBowlerId,
        playerName: bowlerName,
        jerseyNumber: bowlerJersey,
        teamId: bowlingTeamId,
        teamName: resolvedBowlingTeamName,
        type: '4w',
        title: '4 WICKETS!',
        tagline: 'OUTSTANDING BOWLING!',
        wickets: bowlerRecord.wickets,
        overs: bowlerOvers,
        runsConceded: bowlerRecord.runsConceded,
        economy: bowlerEcon,
        inningsNumber: updated.currentInnings,
        timestamp: Date.now(),
      };
    } else if (!bowlerRecord.achievedMilestones.includes('3w') && prevBowlerWickets < 3 && newBowlerWickets >= 3) {
      bowlerRecord.achievedMilestones.push('3w');
      triggeredMilestone = {
        id: `ms_${Date.now()}_3w`,
        playerId: currentBowlerId,
        playerName: bowlerName,
        jerseyNumber: bowlerJersey,
        teamId: bowlingTeamId,
        teamName: resolvedBowlingTeamName,
        type: '3w',
        title: '3-WICKET HAUL!',
        tagline: 'FIERY SPELL!',
        wickets: bowlerRecord.wickets,
        overs: bowlerOvers,
        runsConceded: bowlerRecord.runsConceded,
        economy: bowlerEcon,
        inningsNumber: updated.currentInnings,
        timestamp: Date.now(),
      };
    }

    if (triggeredMilestone) {
      innings.matchMilestones.push(triggeredMilestone);
      updated.milestones.push(triggeredMilestone);
    }

    // Strike Rotation logic:
    // Physical runs that involve batsmen running:
    // runsOffBat (1, 3, 5) OR Byes/Leg Byes (1, 3, 5) OR Wides with odd running runs
    let runningRuns = 0;
    if (runsOffBat % 2 === 1) runningRuns += runsOffBat;
    if ((isBye || isLegBye) && extrasRuns % 2 === 1) runningRuns += extrasRuns;
    if (isWide && extrasRuns > 1 && (extrasRuns - 1) % 2 === 1) runningRuns += (extrasRuns - 1);

    if (runningRuns % 2 === 1) {
      // Swap striker & non-striker
      const temp = updated.currentStrikerId;
      updated.currentStrikerId = updated.currentNonStrikerId;
      updated.currentNonStrikerId = temp;
    }

    // Over Completion Check
    const overCompleted = isLegal && innings.legalBallsBowled > 0 && innings.legalBallsBowled % 6 === 0;

    if (overCompleted) {
      // At the end of the over, batsmen change ends!
      const temp = updated.currentStrikerId;
      updated.currentStrikerId = updated.currentNonStrikerId;
      updated.currentNonStrikerId = temp;

      updated.lastBowlerId = updated.currentBowlerId;
      if (input.nextBowlerId) {
        updated.currentBowlerId = input.nextBowlerId;
      }
    }

    // Build delivery record
    const deliveryId = `ball_${Date.now()}_${innings.legalBallsBowled}_${Math.random().toString(36).substring(2, 6)}`;
    const overIndex = Math.floor((innings.legalBallsBowled - (isLegal ? 1 : 0)) / 6);
    const ballInOver = (innings.legalBallsBowled % 6 === 0 && isLegal) ? 6 : (innings.legalBallsBowled % 6);

    let comm = `${getPlayerName(currentBowlerId)} to ${getPlayerName(currentStrikerId)}: `;
    if (input.isWicket) comm += `WICKET! ${wicketDetail?.description || 'Out'}`;
    else if (isWide) comm += `Wide ball (${extrasRuns || 1} wd)`;
    else if (isNoBall) comm += `No ball! (${runsOffBat > 0 ? runsOffBat + ' off bat + ' : ''}1 nb)`;
    else if (isBye) comm += `${extrasRuns} bye${extrasRuns > 1 ? 's' : ''}`;
    else if (isLegBye) comm += `${extrasRuns} leg-bye${extrasRuns > 1 ? 's' : ''}`;
    else if (runsOffBat === 6) comm += `SIX! Smashed high over the boundary!`;
    else if (runsOffBat === 4) comm += `FOUR! Cracking shot through the ropes!`;
    else if (runsOffBat === 0) comm += `No run, dot ball.`;
    else comm += `${runsOffBat} run${runsOffBat > 1 ? 's' : ''}.`;

    const delivery: BallDelivery = {
      id: deliveryId,
      inningsNumber: updated.currentInnings,
      overIndex,
      ballInOver,
      isLegal,
      batsmanId: currentStrikerId,
      nonStrikerId: currentNonStrikerId,
      bowlerId: currentBowlerId,
      runsOffBat,
      extras: {
        type: input.extrasType,
        runs: extrasRuns || (isWide || isNoBall ? 1 : 0),
      },
      isWicket: input.isWicket,
      wicketDetail,
      scoreAfterBall: {
        runs: innings.totalRuns,
        wickets: innings.totalWickets,
        oversString: ballsToOversString(innings.legalBallsBowled),
      },
      commentary: comm,
      timestamp: Date.now(),
    };

    innings.deliveries.push(delivery);

    // Check innings completion conditions:
    // 1. All out: max wickets is batting squad size - 1 (or 10)
    const maxWickets = Math.min(10, Math.max(1, battingTeam.playerIds.length - 1));
    const isAllOut = innings.totalWickets >= maxWickets;
    // 2. Overs complete
    const maxBalls = updated.totalOvers * 6;
    const isOversFinished = innings.legalBallsBowled >= maxBalls;

    // 3. In 2nd innings: target chased down
    let isTargetChased = false;
    if (updated.currentInnings === 2 && updated.target && innings.totalRuns >= updated.target) {
      isTargetChased = true;
    }

    let isInningsEnded = false;
    let isMatchEnded = false;

    if (updated.currentInnings === 1) {
      if (isAllOut || isOversFinished) {
        innings.isCompleted = true;
        isInningsEnded = true;
        updated.target = innings.totalRuns + 1;
      }
    } else {
      // 2nd Innings
      if (isTargetChased || isAllOut || isOversFinished) {
        innings.isCompleted = true;
        isInningsEnded = true;
        isMatchEnded = true;
        updated.status = 'completed';

        // Calculate Result
        const team1Runs = updated.innings1.totalRuns;
        const team2Runs = innings.totalRuns;
        const team1Id = updated.innings1.battingTeamId;
        const team2Id = innings.battingTeamId;

        if (team2Runs >= (updated.target || team1Runs + 1)) {
          // Chasing team won
          const wicketsRemaining = maxWickets - innings.totalWickets;
          updated.result = {
            winnerTeamId: team2Id,
            winType: 'wickets',
            margin: wicketsRemaining,
            summaryText: `${battingTeam.name} won by ${wicketsRemaining} wicket${wicketsRemaining > 1 ? 's' : ''}`,
          };
        } else if (team2Runs === team1Runs) {
          updated.result = {
            winType: 'tie',
            summaryText: 'Match Tied! Thrilling finish!',
          };
        } else {
          // Defending team won
          const runMargin = team1Runs - team2Runs;
          updated.result = {
            winnerTeamId: team1Id,
            winType: 'runs',
            margin: runMargin,
            summaryText: `${getPlayerName(team1Id) || 'Defending team'} won by ${runMargin} run${runMargin > 1 ? 's' : ''}`,
          };
        }

        // Evaluate Player of the match
        const potm = evaluatePlayerOfTheMatch(updated, getPlayerName);
        if (potm) {
          updated.result.playerOfTheMatchId = potm.playerId;
          updated.result.playerOfTheMatchName = potm.name;
          updated.result.playerOfTheMatchPerformance = potm.performanceText;
        }
      }
    }

    const requiresNewBatsman = input.isWicket && !input.incomingBatsmanId && !isAllOut && !isTargetChased;
    const requiresNewBowler = overCompleted && !input.nextBowlerId && !isInningsEnded && !isMatchEnded;

    return {
      updatedMatch: updated,
      requiresNewBatsman,
      requiresNewBowler,
      isInningsEnded,
      isMatchEnded,
      newMilestone: triggeredMilestone,
    };
  },

  /**
   * Undoes the last recorded delivery and accurately rolls back the match state.
   */
  undoLastDelivery(
    match: Match,
    battingTeam: Team,
    getPlayerName: (id: string) => string
  ): Match {
    const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;
    if (!innings || innings.deliveries.length === 0) {
      return match;
    }

    // Pop the last delivery
    const updated: Match = JSON.parse(JSON.stringify(match));
    const curInnings = updated.currentInnings === 1 ? updated.innings1 : updated.innings2!;
    const deliveries = [...curInnings.deliveries];
    deliveries.pop(); // Remove last ball

    // Reconstruct the innings cleanly from remaining deliveries
    curInnings.totalRuns = 0;
    curInnings.totalWickets = 0;
    curInnings.legalBallsBowled = 0;
    curInnings.extras = {
      wides: 0,
      noBalls: 0,
      byes: 0,
      legByes: 0,
      penalties: 0,
      total: 0,
    };
    curInnings.batsmanRecords = {};
    curInnings.bowlerRecords = {};
    curInnings.fallOfWickets = [];
    curInnings.deliveries = [];
    curInnings.isCompleted = false;

    // Reset match status if it was completed
    if (updated.status === 'completed') {
      updated.status = 'live';
      delete updated.result;
    }

    // Re-play all balls through engine
    let tempMatch = { ...updated };
    deliveries.forEach((del) => {
      const res = CricketEngine.processDelivery(
        tempMatch,
        {
          runsOffBat: del.runsOffBat,
          extrasType: del.extras.type,
          extrasRuns: del.extras.runs,
          isWicket: del.isWicket,
          wicketType: del.wicketDetail?.type,
          dismissedPlayerId: del.wicketDetail?.dismissedPlayerId,
          fielderId: del.wicketDetail?.fielderId,
        },
        battingTeam,
        getPlayerName
      );
      tempMatch = res.updatedMatch;
    });

    return tempMatch;
  },

  /**
   * Manual swap of strike between Striker and Non-Striker
   */
  swapStrike(match: Match): Match {
    const updated = JSON.parse(JSON.stringify(match));
    const temp = updated.currentStrikerId;
    updated.currentStrikerId = updated.currentNonStrikerId;
    updated.currentNonStrikerId = temp;
    return updated;
  },
};
