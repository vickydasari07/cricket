import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  ArrowRightLeft,
  Award,
  AlertTriangle,
  Trophy,
  CheckCircle2,
  ChevronRight,
  User,
  Shield,
  Clock,
  Sparkles,
  Volume2,
  X,
  FileText,
} from 'lucide-react';
import {
  Match,
  Team,
  Player,
  WicketType,
  Innings,
  BallDelivery,
  MatchMilestoneItem,
} from '../types/cricket';
import {
  ballsToOversString,
  calculateStrikeRate,
  calculateEconomy,
  calculateRunRate,
  calculateRequiredRunRate,
  formatJersey,
  formatPlayerDisplay,
} from '../utils/cricketMath';
import { CricketEngine, ScoreDeliveryInput } from '../services/cricketEngine';
import { soundEffects } from '../utils/audio';
import { MilestoneCelebration } from './MilestoneCelebration';

interface LiveScoringProps {
  match: Match;
  teams: Team[];
  players: Player[];
  onUpdateMatch: (updatedMatch: Match) => void;
  onViewScorecard: (matchId: string) => void;
  onBackToHome: () => void;
}

export const LiveScoring: React.FC<LiveScoringProps> = ({
  match,
  teams,
  players,
  onUpdateMatch,
  onViewScorecard,
  onBackToHome,
}) => {
  // Active innings
  const currentInningsNum = match.currentInnings;
  const innings = currentInningsNum === 1 ? match.innings1 : match.innings2!;

  const battingTeam = teams.find((t) => t.id === innings.battingTeamId) || teams[0];
  const bowlingTeam = teams.find((t) => t.id === innings.bowlingTeamId) || teams[1];

  const getPlayer = (id: string): Player | undefined => players.find((p) => p.id === id);
  const getPlayerName = (id: string): string => getPlayer(id)?.name || 'Player';
  const getPlayerDisplay = (id: string): string => {
    const p = getPlayer(id);
    return p ? `${formatJersey(p.jerseyNumber)} ${p.name}` : 'Player';
  };

  // Modal Dialogs
  const [isWicketModalOpen, setIsWicketModalOpen] = useState(false);
  const [isOverModalOpen, setIsOverModalOpen] = useState(false);
  const [isInningsBreakModalOpen, setIsInningsBreakModalOpen] = useState(false);
  const [isMatchFinishedModalOpen, setIsMatchFinishedModalOpen] = useState(false);
  const [isExtrasModalOpen, setIsExtrasModalOpen] = useState(false);
  const [selectedExtraType, setSelectedExtraType] = useState<'wide' | 'no-ball' | 'bye' | 'leg-bye'>('wide');

  // Wicket modal form state
  const [selectedWicketType, setSelectedWicketType] = useState<WicketType>('Caught');
  const [dismissedPlayerId, setDismissedPlayerId] = useState(match.currentStrikerId);
  const [wicketFielderId, setWicketFielderId] = useState('');
  const [incomingBatsmanId, setIncomingBatsmanId] = useState('');

  // Over change form state
  const [nextBowlerId, setNextBowlerId] = useState('');

  // Innings 2 start state
  const [inn2StrikerId, setInn2StrikerId] = useState('');
  const [inn2NonStrikerId, setInn2NonStrikerId] = useState('');
  const [inn2BowlerId, setInn2BowlerId] = useState('');

  // Extras modal state
  const [extraRunsInput, setExtraRunsInput] = useState<number>(1);
  const [nbRunsOffBat, setNbRunsOffBat] = useState<number>(0);

  // Active Milestone Celebration State
  const [activeMilestone, setActiveMilestone] = useState<MatchMilestoneItem | null>(null);
  const [isMilestoneHistoryOpen, setIsMilestoneHistoryOpen] = useState(false);
  const [celebrationAnimations, setCelebrationAnimations] = useState(soundEffects.celebrationAnimationsEnabled);
  const [milestoneSound, setMilestoneSound] = useState(soundEffects.milestoneSoundEnabled);

  // Status message / toast
  const [actionNotice, setActionNotice] = useState<string>('');

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3000);
  };

  // Trigger celebration on match completed
  useEffect(() => {
    if (match.status === 'completed' && !isMatchFinishedModalOpen) {
      setIsMatchFinishedModalOpen(true);
      soundEffects.playVictory();
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [match.status]);

  // Current Crease Batsmen
  const strikerRecord = innings.batsmanRecords[match.currentStrikerId] || {
    playerId: match.currentStrikerId,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
  };

  const nonStrikerRecord = innings.batsmanRecords[match.currentNonStrikerId] || {
    playerId: match.currentNonStrikerId,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
  };

  // Current Bowler
  const bowlerRecord = innings.bowlerRecords[match.currentBowlerId] || {
    playerId: match.currentBowlerId,
    legalBalls: 0,
    maidens: 0,
    runsConceded: 0,
    wickets: 0,
    wides: 0,
    noBalls: 0,
  };

  // Available batsmen who haven't batted or been dismissed
  const availableIncomingBatsmen = battingTeam.playerIds
    .filter(
      (id) =>
        id !== match.currentStrikerId &&
        id !== match.currentNonStrikerId &&
        !innings.batsmanRecords[id]?.isOut
    )
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  // Eligible bowlers for next over (cannot bowl 2 consecutive overs)
  const eligibleNextBowlers = bowlingTeam.playerIds
    .filter((id) => id !== match.currentBowlerId)
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  // Current Over Deliveries
  const currentOverNumber = Math.floor(innings.legalBallsBowled / 6);
  // Get deliveries that occurred in this current over
  const currentOverDeliveries = innings.deliveries.filter((d) => d.overIndex === currentOverNumber);

  // Rates calculations
  const crr = calculateRunRate(innings.totalRuns, innings.legalBallsBowled);
  const chaseInfo =
    match.currentInnings === 2 && match.target
      ? calculateRequiredRunRate(
          match.target,
          innings.totalRuns,
          match.totalOvers,
          innings.legalBallsBowled
        )
      : null;

  // Process standard delivery
  const handleScoreRuns = (runs: number) => {
    if (match.status === 'completed') return;

    // Sound effect
    if (runs === 4) soundEffects.playBatHit(true, false);
    else if (runs === 6) soundEffects.playBatHit(false, true);
    else soundEffects.playBatHit(false, false);

    const result = CricketEngine.processDelivery(
      match,
      {
        runsOffBat: runs,
        isWicket: false,
      },
      battingTeam,
      getPlayerName,
      bowlingTeam,
      getPlayer
    );

    onUpdateMatch(result.updatedMatch);

    if (result.newMilestone) {
      setActiveMilestone(result.newMilestone);
    }

    if (result.isMatchEnded) {
      setIsMatchFinishedModalOpen(true);
    } else if (result.isInningsEnded) {
      setIsInningsBreakModalOpen(true);
    } else if (result.requiresNewBowler) {
      setNextBowlerId(eligibleNextBowlers[0]?.id || '');
      setIsOverModalOpen(true);
    }
  };

  // Open Wicket Dialog
  const handleOpenWicketModal = () => {
    setSelectedWicketType('Caught');
    setDismissedPlayerId(match.currentStrikerId);
    setWicketFielderId('');
    setIncomingBatsmanId(availableIncomingBatsmen[0]?.id || '');
    setIsWicketModalOpen(true);
  };

  // Submit Wicket
  const handleConfirmWicket = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playWicket();
    setIsWicketModalOpen(false);

    const result = CricketEngine.processDelivery(
      match,
      {
        runsOffBat: 0,
        isWicket: true,
        wicketType: selectedWicketType,
        dismissedPlayerId,
        fielderId: wicketFielderId || undefined,
        incomingBatsmanId: incomingBatsmanId || undefined,
      },
      battingTeam,
      getPlayerName,
      bowlingTeam,
      getPlayer
    );

    onUpdateMatch(result.updatedMatch);
    showNotice(`WICKET! ${getPlayerName(dismissedPlayerId)} dismissed (${selectedWicketType})`);

    if (result.newMilestone) {
      setActiveMilestone(result.newMilestone);
    }

    if (result.isMatchEnded) {
      setIsMatchFinishedModalOpen(true);
    } else if (result.isInningsEnded) {
      setIsInningsBreakModalOpen(true);
    } else if (result.requiresNewBowler) {
      setNextBowlerId(eligibleNextBowlers[0]?.id || '');
      setIsOverModalOpen(true);
    }
  };

  // Open Extras Dialog
  const handleOpenExtrasModal = (type: 'wide' | 'no-ball' | 'bye' | 'leg-bye') => {
    setSelectedExtraType(type);
    setExtraRunsInput(1);
    setNbRunsOffBat(0);
    setIsExtrasModalOpen(true);
  };

  // Submit Extra
  const handleConfirmExtras = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playBeep();
    setIsExtrasModalOpen(false);

    const result = CricketEngine.processDelivery(
      match,
      {
        runsOffBat: selectedExtraType === 'no-ball' ? nbRunsOffBat : 0,
        extrasType: selectedExtraType,
        extrasRuns: extraRunsInput,
        isWicket: false,
      },
      battingTeam,
      getPlayerName,
      bowlingTeam,
      getPlayer
    );

    onUpdateMatch(result.updatedMatch);

    if (result.newMilestone) {
      setActiveMilestone(result.newMilestone);
    }

    if (result.isMatchEnded) {
      setIsMatchFinishedModalOpen(true);
    } else if (result.isInningsEnded) {
      setIsInningsBreakModalOpen(true);
    } else if (result.requiresNewBowler) {
      setNextBowlerId(eligibleNextBowlers[0]?.id || '');
      setIsOverModalOpen(true);
    }
  };

  // Confirm Next Bowler at Over End
  const handleConfirmNextBowler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextBowlerId) return;

    if (nextBowlerId === match.currentBowlerId) {
      showNotice('Bowler cannot bowl consecutive overs!');
      return;
    }

    const updated = JSON.parse(JSON.stringify(match));
    updated.lastBowlerId = updated.currentBowlerId;
    updated.currentBowlerId = nextBowlerId;

    onUpdateMatch(updated);
    setIsOverModalOpen(false);
    showNotice(`Over complete. ${getPlayerName(nextBowlerId)} is the new bowler.`);
  };

  // Undo Last Delivery
  const handleUndo = () => {
    if (innings.deliveries.length === 0) {
      showNotice('No deliveries to undo in this innings.');
      return;
    }
    soundEffects.playBeep();
    const updated = CricketEngine.undoLastDelivery(match, battingTeam, getPlayerName);
    onUpdateMatch(updated);
    showNotice('Last delivery undone.');
  };

  // Swap Strike
  const handleSwapStrike = () => {
    soundEffects.playBeep();
    const updated = CricketEngine.swapStrike(match);
    onUpdateMatch(updated);
    showNotice('Strike rotated.');
  };

  // Start 2nd Innings Transition
  const handleStartSecondInnings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inn2StrikerId || !inn2NonStrikerId || !inn2BowlerId) {
      showNotice('Please select both opening batsmen and bowler.');
      return;
    }
    if (inn2StrikerId === inn2NonStrikerId) {
      showNotice('Striker and Non-striker must be different players.');
      return;
    }

    const targetRuns = match.innings1.totalRuns + 1;
    const inn2BattingTeamId = match.innings1.bowlingTeamId;
    const inn2BowlingTeamId = match.innings1.battingTeamId;

    const innings2: Innings = {
      inningsNumber: 2,
      battingTeamId: inn2BattingTeamId,
      bowlingTeamId: inn2BowlingTeamId,
      totalRuns: 0,
      totalWickets: 0,
      legalBallsBowled: 0,
      extras: {
        wides: 0,
        noBalls: 0,
        byes: 0,
        legByes: 0,
        penalties: 0,
        total: 0,
      },
      batsmanRecords: {
        [inn2StrikerId]: {
          playerId: inn2StrikerId,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          isOut: false,
        },
        [inn2NonStrikerId]: {
          playerId: inn2NonStrikerId,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          isOut: false,
        },
      },
      bowlerRecords: {
        [inn2BowlerId]: {
          playerId: inn2BowlerId,
          legalBalls: 0,
          maidens: 0,
          runsConceded: 0,
          wickets: 0,
          wides: 0,
          noBalls: 0,
        },
      },
      fallOfWickets: [],
      deliveries: [],
      isCompleted: false,
    };

    const updated: Match = {
      ...match,
      currentInnings: 2,
      target: targetRuns,
      innings2,
      currentStrikerId: inn2StrikerId,
      currentNonStrikerId: inn2NonStrikerId,
      currentBowlerId: inn2BowlerId,
      lastBowlerId: undefined,
      updatedAt: Date.now(),
    };

    onUpdateMatch(updated);
    setIsInningsBreakModalOpen(false);
    showNotice(`2nd Innings Started! Target: ${targetRuns} runs`);
  };

  // Prepare defaults for 2nd innings modal
  useEffect(() => {
    if (isInningsBreakModalOpen && match.currentInnings === 1) {
      const inn2BattingTeam = teams.find((t) => t.id === match.innings1.bowlingTeamId);
      const inn2BowlingTeam = teams.find((t) => t.id === match.innings1.battingTeamId);
      if (inn2BattingTeam && inn2BattingTeam.playerIds.length >= 2) {
        setInn2StrikerId(inn2BattingTeam.playerIds[0]);
        setInn2NonStrikerId(inn2BattingTeam.playerIds[1]);
      }
      if (inn2BowlingTeam && inn2BowlingTeam.playerIds.length > 0) {
        setInn2BowlerId(inn2BowlingTeam.playerIds[0]);
      }
    }
  }, [isInningsBreakModalOpen]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-xl animate-bounce">
          {actionNotice}
        </div>
      )}

      {/* Match Meta Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-cyber font-bold text-white uppercase tracking-wider">
            {battingTeam.name} vs {bowlingTeam.name}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">
            {match.format} ({match.totalOvers} Overs)
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">{match.venue}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Milestone animation & sound toggles */}
          <button
            onClick={() => {
              const next = !celebrationAnimations;
              setCelebrationAnimations(next);
              soundEffects.celebrationAnimationsEnabled = next;
            }}
            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              celebrationAnimations
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Celebration Animations"
          >
            <span>🎉 Animations: {celebrationAnimations ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => {
              const next = !milestoneSound;
              setMilestoneSound(next);
              soundEffects.milestoneSoundEnabled = next;
            }}
            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              milestoneSound
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Milestone Sound Effects"
          >
            <Volume2 size={13} />
            <span>Sound: {milestoneSound ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => onViewScorecard(match.id)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <FileText size={13} className="text-emerald-400" />
            <span>Full Scorecard</span>
          </button>

          {match.milestones && match.milestones.length > 0 && (
            <button
              onClick={() => setIsMilestoneHistoryOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
              title="View all match milestones"
            >
              <span>🎉 Milestones ({match.milestones.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* AUTOMATIC MILESTONE CELEBRATION (Positioned ABOVE the Live Scoreboard) */}
      {activeMilestone && (
        <MilestoneCelebration
          milestone={activeMilestone}
          onDismiss={() => setActiveMilestone(null)}
          jerseyNumber={getPlayer(activeMilestone.playerId)?.jerseyNumber}
          animationsEnabled={celebrationAnimations}
          soundEnabled={milestoneSound}
        />
      )}

      {/* Main Scoreboard Display (Big Sports Banner) */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Batting Team and Big Score */}
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span
                style={{ backgroundColor: battingTeam.logoColor }}
                className="w-3.5 h-3.5 rounded-full inline-block"
              />
              <span className="font-cyber font-bold text-sm sm:text-base text-slate-300 uppercase tracking-wider">
                {battingTeam.name}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({currentInningsNum === 1 ? '1st Innings' : '2nd Innings'})
              </span>
            </div>

            {/* Score: 124/3 */}
            <div className="flex items-baseline gap-3">
              <h1 className="font-cyber font-black text-5xl sm:text-6xl text-white tracking-tight">
                <span className="font-mono-num text-emerald-400">{innings.totalRuns}</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="font-mono-num text-white">{innings.totalWickets}</span>
              </h1>

              <div className="text-slate-400 text-sm sm:text-base font-semibold">
                Overs:{' '}
                <span className="font-mono-num text-white">
                  {ballsToOversString(innings.legalBallsBowled)}
                </span>
                <span className="text-slate-500 text-xs font-normal"> / {match.totalOvers}</span>
              </div>
            </div>

            {/* Extras line */}
            <p className="text-xs text-slate-400 mt-2">
              Extras:{' '}
              <span className="font-mono-num font-bold text-slate-200">
                {innings.extras.total}
              </span>{' '}
              <span className="text-[11px] text-slate-500">
                (WD {innings.extras.wides}, NB {innings.extras.noBalls}, B {innings.extras.byes}, LB{' '}
                {innings.extras.legByes}
                {innings.extras.penalties > 0 ? `, PEN ${innings.extras.penalties}` : ''})
              </span>
            </p>
          </div>

          {/* Rates & Chase Target */}
          <div className="space-y-2 md:text-right">
            <div className="flex md:justify-end items-center gap-4">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center md:text-right min-w-[90px]">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                  CRR
                </span>
                <span className="font-mono-num font-bold text-base sm:text-lg text-emerald-400">
                  {crr.toFixed(2)}
                </span>
              </div>

              {chaseInfo && (
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center md:text-right min-w-[90px]">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                    RRR
                  </span>
                  <span className="font-mono-num font-bold text-base sm:text-lg text-amber-400">
                    {chaseInfo.requiredRunRate.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Target reminder */}
            {chaseInfo && (
              <p className="text-xs font-medium text-amber-300">
                Need <span className="font-bold">{chaseInfo.requiredRuns} runs</span> from{' '}
                <span className="font-bold">{chaseInfo.remainingBalls} balls</span>
              </p>
            )}

            {currentInningsNum === 1 && (
              <p className="text-xs text-slate-400">
                Remaining:{' '}
                <span className="font-mono-num text-slate-200">
                  {Math.max(0, match.totalOvers * 6 - innings.legalBallsBowled)} balls
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Crease Cards: Striker, Non-Striker, Bowler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Batsman 1 (Striker) */}
        <div className="p-4 rounded-2xl bg-slate-900 border-2 border-emerald-500/50 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Striker
            </span>
            <span className="font-mono-num">
              SR {calculateStrikeRate(strikerRecord.runs, strikerRecord.balls)}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono-num font-black text-xs px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                {formatJersey(getPlayer(match.currentStrikerId)?.jerseyNumber)}
              </span>
              <h3 className="font-cyber font-bold text-base text-white truncate">
                {getPlayerName(match.currentStrikerId)} *
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono-num font-black text-xl text-white">
                {strikerRecord.runs}*
              </span>
              <span className="text-xs text-slate-400 font-mono-num"> ({strikerRecord.balls})</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono-num">
            <span>
              {strikerRecord.fours}×4 &nbsp;&nbsp; {strikerRecord.sixes}×6
            </span>
            <span className="text-emerald-400 font-semibold">
              SR {calculateStrikeRate(strikerRecord.runs, strikerRecord.balls)}
            </span>
          </div>
        </div>

        {/* Batsman 2 (Non-Striker) */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-2">
            <span>Non-Striker</span>
            <span className="font-mono-num">
              SR {calculateStrikeRate(nonStrikerRecord.runs, nonStrikerRecord.balls)}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono-num font-black text-xs px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                {formatJersey(getPlayer(match.currentNonStrikerId)?.jerseyNumber)}
              </span>
              <h3 className="font-cyber font-bold text-base text-slate-200 truncate">
                {getPlayerName(match.currentNonStrikerId)}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono-num font-black text-xl text-slate-200">
                {nonStrikerRecord.runs}
              </span>
              <span className="text-xs text-slate-400 font-mono-num"> ({nonStrikerRecord.balls})</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono-num">
            <span>
              {nonStrikerRecord.fours}×4 &nbsp;&nbsp; {nonStrikerRecord.sixes}×6
            </span>
            <span className="text-slate-300">
              SR {calculateStrikeRate(nonStrikerRecord.runs, nonStrikerRecord.balls)}
            </span>
          </div>
        </div>

        {/* Current Bowler */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-bold uppercase mb-2">
            <span>Bowler</span>
            <span className="font-mono-num">
              ECO {calculateEconomy(bowlerRecord.runsConceded, bowlerRecord.legalBalls)}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono-num font-black text-xs px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                {formatJersey(getPlayer(match.currentBowlerId)?.jerseyNumber)}
              </span>
              <h3 className="font-cyber font-bold text-base text-white truncate">
                {getPlayerName(match.currentBowlerId)}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono-num font-black text-lg text-teal-400">
                {bowlerRecord.wickets}
              </span>
              <span className="text-xs text-slate-400 font-mono-num"> / {bowlerRecord.runsConceded}</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono-num">
            <span>
              {ballsToOversString(bowlerRecord.legalBalls)} - {bowlerRecord.maidens} - {bowlerRecord.runsConceded} - {bowlerRecord.wickets}
            </span>
            <span className="text-cyan-400 font-semibold">
              ECO {calculateEconomy(bowlerRecord.runsConceded, bowlerRecord.legalBalls)}
            </span>
          </div>
        </div>
      </div>

      {/* Current Over Deliveries Strip */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Clock size={15} className="text-slate-400" />
          <span className="text-xs font-cyber font-bold uppercase tracking-wider text-slate-300">
            This Over:
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {currentOverDeliveries.length > 0 ? (
            currentOverDeliveries.map((del) => {
              let badgeText = `${del.runsOffBat}`;
              let styleClass = 'bg-slate-800 text-slate-200 border-slate-700';

              if (del.isWicket) {
                badgeText = 'W';
                styleClass = 'bg-rose-500 text-slate-950 font-black border-rose-400 shadow-md shadow-rose-500/30';
              } else if (del.extras.type === 'wide') {
                badgeText = del.extras.runs > 1 ? `${del.extras.runs}wd` : 'wd';
                styleClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
              } else if (del.extras.type === 'no-ball') {
                badgeText = del.runsOffBat > 0 ? `${del.runsOffBat}nb` : 'nb';
                styleClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
              } else if (del.extras.type === 'bye') {
                badgeText = `${del.extras.runs}b`;
                styleClass = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
              } else if (del.extras.type === 'leg-bye') {
                badgeText = `${del.extras.runs}lb`;
                styleClass = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
              } else if (del.runsOffBat === 4) {
                styleClass = 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-md shadow-emerald-500/30';
              } else if (del.runsOffBat === 6) {
                styleClass = 'bg-purple-500 text-slate-950 font-black border-purple-400 shadow-md shadow-purple-500/30';
              } else if (del.runsOffBat === 0) {
                badgeText = '•';
                styleClass = 'bg-slate-950 text-slate-500 border-slate-800';
              }

              return (
                <div
                  key={del.id}
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center font-mono-num font-bold text-xs shrink-0 ${styleClass}`}
                  title={del.commentary}
                >
                  {badgeText}
                </div>
              );
            })
          ) : (
            <span className="text-xs text-slate-500 italic">Over starting...</span>
          )}
        </div>
      </div>

      {/* Main Touch Scoring Pad (Large, accessible, thumb-friendly) */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        {/* Row 1: Runs off bat */}
        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {[0, 1, 2, 3, 4, 6].map((run) => {
            const isFour = run === 4;
            const isSix = run === 6;

            return (
              <button
                key={run}
                onClick={() => handleScoreRuns(run)}
                className={`h-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-cyber font-black text-2xl sm:text-3xl active:scale-95 transition-all shadow-md ${
                  isFour
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                    : isSix
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-500/20'
                    : 'bg-slate-950 hover:bg-slate-850 text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{run}</span>
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400/80 -mt-1">
                  {run === 0 ? 'Dot' : run === 4 ? 'Four' : run === 6 ? 'Six' : 'Run'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 2: WICKET, WD, NB, BYE, LB */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {/* Big WICKET Button */}
          <button
            onClick={handleOpenWicketModal}
            className="h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-cyber font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/25 active:scale-95 transition-all"
          >
            <span>WICKET</span>
          </button>

          {/* Wide */}
          <button
            onClick={() => handleOpenExtrasModal('wide')}
            className="h-14 sm:h-16 rounded-2xl bg-slate-950 hover:bg-slate-850 text-amber-400 border border-slate-800 font-cyber font-bold text-sm sm:text-base active:scale-95 transition-all"
          >
            WD
          </button>

          {/* No Ball */}
          <button
            onClick={() => handleOpenExtrasModal('no-ball')}
            className="h-14 sm:h-16 rounded-2xl bg-slate-950 hover:bg-slate-850 text-amber-400 border border-slate-800 font-cyber font-bold text-sm sm:text-base active:scale-95 transition-all"
          >
            NB
          </button>

          {/* Bye */}
          <button
            onClick={() => handleOpenExtrasModal('bye')}
            className="h-14 sm:h-16 rounded-2xl bg-slate-950 hover:bg-slate-850 text-indigo-300 border border-slate-800 font-cyber font-bold text-sm sm:text-base active:scale-95 transition-all"
          >
            BYE
          </button>

          {/* Leg Bye */}
          <button
            onClick={() => handleOpenExtrasModal('leg-bye')}
            className="h-14 sm:h-16 rounded-2xl bg-slate-950 hover:bg-slate-850 text-indigo-300 border border-slate-800 font-cyber font-bold text-sm sm:text-base active:scale-95 transition-all"
          >
            LB
          </button>
        </div>

        {/* Row 3: SWAP STRIKE, UNDO */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleSwapStrike}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-cyber font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <ArrowRightLeft size={15} className="text-emerald-400" />
            <span>Swap Strike</span>
          </button>

          <button
            onClick={handleUndo}
            disabled={innings.deliveries.length === 0}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-cyber font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            <RotateCcw size={15} className="text-amber-400" />
            <span>Undo Ball</span>
          </button>
        </div>
      </div>

      {/* WICKET MODAL */}
      {isWicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-rose-500/40 shadow-2xl overflow-hidden my-8">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-cyber font-black text-xl text-rose-400 uppercase tracking-wider">
                  WICKET FALL
                </h2>
                <p className="text-xs text-slate-400">Record dismissal details & incoming batsman</p>
              </div>
              <button
                onClick={() => setIsWicketModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmWicket} className="p-5 sm:p-6 space-y-4">
              {/* Wicket Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                  Dismissal Type
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {(
                    [
                      'Bowled',
                      'Caught',
                      'LBW',
                      'Run Out',
                      'Stumped',
                      'Hit Wicket',
                      'Retired Out',
                    ] as WicketType[]
                  ).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedWicketType(type)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-cyber font-bold transition-all ${
                        selectedWicketType === type
                          ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/25'
                          : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dismissed Batsman (Striker or Non-striker for Run Out) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Dismissed Batsman
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDismissedPlayerId(match.currentStrikerId)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      dismissedPlayerId === match.currentStrikerId
                        ? 'bg-rose-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-300 border border-slate-800'
                    }`}
                  >
                    Striker: {getPlayerDisplay(match.currentStrikerId)}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDismissedPlayerId(match.currentNonStrikerId)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      dismissedPlayerId === match.currentNonStrikerId
                        ? 'bg-rose-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-300 border border-slate-800'
                    }`}
                  >
                    Non-Striker: {getPlayerDisplay(match.currentNonStrikerId)}
                  </button>
                </div>
              </div>

              {/* Fielder (if Caught, Run Out, Stumped) */}
              {['Caught', 'Run Out', 'Stumped'].includes(selectedWicketType) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Fielder / Catcher
                  </label>
                  <select
                    value={wicketFielderId}
                    onChange={(e) => setWicketFielderId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="">Select Fielder (Optional)</option>
                    {bowlingTeam.playerIds.map((id) => (
                      <option key={id} value={id}>
                        {getPlayerDisplay(id)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Incoming Next Batsman */}
              <div>
                <label className="block text-xs font-semibold text-emerald-400 uppercase mb-1">
                  Incoming Next Batsman *
                </label>
                {availableIncomingBatsmen.length > 0 ? (
                  <select
                    required
                    value={incomingBatsmanId}
                    onChange={(e) => setIncomingBatsmanId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    {availableIncomingBatsmen.map((p) => (
                      <option key={p.id} value={p.id}>
                        {formatJersey(p.jerseyNumber)} {p.name} ({p.role})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300">
                    All Out! No remaining batsmen available.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsWicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-cyber font-bold text-xs uppercase tracking-wider"
                >
                  Confirm Wicket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXTRAS MODAL */}
      {isExtrasModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-cyber font-bold text-lg text-amber-400 uppercase tracking-wider">
                  RECORD EXTRAS ({selectedExtraType.toUpperCase()})
                </h2>
                <p className="text-xs text-slate-400">Specify runs conceded as extras</p>
              </div>
              <button
                onClick={() => setIsExtrasModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmExtras} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                  Total Extra Runs
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setExtraRunsInput(r)}
                      className={`py-2 rounded-xl font-mono-num font-bold text-sm ${
                        extraRunsInput === r
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-950 text-white border border-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {selectedExtraType === 'no-ball' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                    Runs off Bat (if hit)
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {[0, 1, 2, 3, 4, 6].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNbRunsOffBat(r)}
                        className={`py-2 rounded-xl font-mono-num font-bold text-sm ${
                          nbRunsOffBat === r
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-950 text-white border border-slate-800'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsExtrasModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider"
                >
                  Record Extra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVER COMPLETED MODAL (Select New Bowler) */}
      {isOverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-gradient-to-r from-emerald-950/60 to-slate-900 border-b border-slate-800">
              <h2 className="font-cyber font-bold text-xl text-emerald-400 uppercase tracking-wider">
                OVER COMPLETED
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Overs bowled: {ballsToOversString(innings.legalBallsBowled)} · Batsmen have changed
                ends
              </p>
            </div>

            <form onSubmit={handleConfirmNextBowler} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                  Select Next Bowler *
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Rule: Bowler {getPlayerDisplay(match.currentBowlerId)} cannot bowl consecutive overs.
                </p>

                <select
                  required
                  value={nextBowlerId}
                  onChange={(e) => setNextBowlerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="">Select Bowler</option>
                  {eligibleNextBowlers.map((p) => {
                    const stats = innings.bowlerRecords[p.id];
                    const ovStr = stats ? ballsToOversString(stats.legalBalls) : '0.0';
                    const wkts = stats ? stats.wickets : 0;
                    return (
                      <option key={p.id} value={p.id}>
                        {formatJersey(p.jerseyNumber)} {p.name} ({p.bowlingStyle}) — {ovStr} ov, {wkts} wkts
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider"
                >
                  Start Next Over
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INNINGS BREAK MODAL (1st Innings Ended) */}
      {isInningsBreakModalOpen && match.currentInnings === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-gradient-to-r from-slate-900 to-emerald-950/60 border-b border-slate-800 text-center space-y-1">
              <span className="text-xs font-cyber font-bold text-emerald-400 uppercase tracking-widest">
                INNINGS COMPLETED
              </span>
              <h2 className="font-cyber font-black text-3xl text-white">
                {battingTeam.name}:{' '}
                <span className="text-emerald-400">
                  {innings.totalRuns}/{innings.totalWickets}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ({ballsToOversString(innings.legalBallsBowled)} Overs) · Target:{' '}
                <strong className="text-amber-300 font-mono-num font-bold">
                  {innings.totalRuns + 1}
                </strong>
              </p>
            </div>

            <form onSubmit={handleStartSecondInnings} className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Setup 2nd Innings Openers ({bowlingTeam.name} to Bat)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Striker (Batsman 1)
                  </label>
                  <select
                    required
                    value={inn2StrikerId}
                    onChange={(e) => setInn2StrikerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium"
                  >
                    {bowlingTeam.playerIds.map((id) => (
                      <option key={id} value={id} disabled={id === inn2NonStrikerId}>
                        {getPlayerDisplay(id)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Non-Striker (Batsman 2)
                  </label>
                  <select
                    required
                    value={inn2NonStrikerId}
                    onChange={(e) => setInn2NonStrikerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium"
                  >
                    {bowlingTeam.playerIds.map((id) => (
                      <option key={id} value={id} disabled={id === inn2StrikerId}>
                        {getPlayerDisplay(id)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Opening Bowler ({battingTeam.name})
                </label>
                <select
                  required
                  value={inn2BowlerId}
                  onChange={(e) => setInn2BowlerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium"
                >
                  {battingTeam.playerIds.map((id) => (
                    <option key={id} value={id}>
                      {getPlayerDisplay(id)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider"
                >
                  Start 2nd Innings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MATCH FINISHED CELEBRATION MODAL */}
      {isMatchFinishedModalOpen && match.result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-emerald-500/50 shadow-2xl overflow-hidden my-8 text-center p-6 sm:p-8 space-y-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 mx-auto shadow-xl shadow-amber-500/30">
              <Trophy size={42} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-cyber font-bold text-amber-400 uppercase tracking-widest">
                MATCH RESULT
              </span>
              <h2 className="font-cyber font-extrabold text-2xl sm:text-3xl text-white">
                {match.result.summaryText}
              </h2>
            </div>

            {/* Scores Recap */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">
                  {teams.find((t) => t.id === match.innings1.battingTeamId)?.name}:
                </span>
                <span className="font-mono-num font-bold text-emerald-400">
                  {match.innings1.totalRuns}/{match.innings1.totalWickets}{' '}
                  <span className="text-xs text-slate-500 font-normal">
                    ({ballsToOversString(match.innings1.legalBallsBowled)} ov)
                  </span>
                </span>
              </div>

              {match.innings2 && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">
                    {teams.find((t) => t.id === match.innings2?.battingTeamId)?.name}:
                  </span>
                  <span className="font-mono-num font-bold text-cyan-400">
                    {match.innings2.totalRuns}/{match.innings2.totalWickets}{' '}
                    <span className="text-xs text-slate-500 font-normal">
                      ({ballsToOversString(match.innings2.legalBallsBowled)} ov)
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Player of the Match */}
            {match.result.playerOfTheMatchName && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Player of the Match
                  </span>
                  <p className="font-cyber font-bold text-base text-white">
                    {match.result.playerOfTheMatchName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {match.result.playerOfTheMatchPerformance}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => onViewScorecard(match.id)}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider transition-colors"
              >
                View Complete Scorecard
              </button>
              <button
                onClick={onBackToHome}
                className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Milestones Modal (Feed of all triggered milestones) */}
      {isMilestoneHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <h3 className="font-cyber font-bold text-lg text-white">MATCH MILESTONES</h3>
              </div>
              <button
                onClick={() => setIsMilestoneHistoryOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
              {(!match.milestones || match.milestones.length === 0) ? (
                <p className="text-center text-xs text-slate-500 py-6">No milestones triggered yet in this match.</p>
              ) : (
                match.milestones.map((ms) => {
                  const p = getPlayer(ms.playerId);
                  return (
                    <div
                      key={ms.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono-num font-black text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                          {formatJersey(ms.jerseyNumber ?? p?.jerseyNumber)}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-cyber font-bold text-sm text-white">{ms.playerName}</span>
                            <span className="text-[10px] font-bold text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/20">
                              {ms.title}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {ms.runs !== undefined
                              ? `${ms.runs} runs (${ms.balls} balls, ${ms.fours}x4, ${ms.sixes}x6, SR ${ms.strikeRate})`
                              : `${ms.wickets} wickets (${ms.overs} ov, ${ms.runsConceded} runs, Econ ${ms.economy})`}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsMilestoneHistoryOpen(false);
                          setActiveMilestone(ms);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white transition-colors shrink-0"
                      >
                        Replay 🎉
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsMilestoneHistoryOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
