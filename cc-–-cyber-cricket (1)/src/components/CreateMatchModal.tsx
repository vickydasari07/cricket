import React, { useState, useEffect } from 'react';
import { X, Play, Trophy, MapPin, Calendar, Flame, AlertCircle } from 'lucide-react';
import { Match, MatchFormat, Team, Player, Innings } from '../types/cricket';
import { formatJersey } from '../utils/cricketMath';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  players: Player[];
  onStartMatch: (match: Match) => void;
}

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({
  isOpen,
  onClose,
  teams,
  players,
  onStartMatch,
}) => {
  const [teamAId, setTeamAId] = useState(teams[0]?.id || '');
  const [teamBId, setTeamBId] = useState(teams[1]?.id || '');
  const [venue, setVenue] = useState('Cyber Cricket Stadium');
  const [matchDate, setMatchDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [format, setFormat] = useState<MatchFormat>('T20');
  const [overs, setOvers] = useState<number>(20);
  const [tossWinnerId, setTossWinnerId] = useState('');
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat');

  // Openers selection
  const [strikerId, setStrikerId] = useState('');
  const [nonStrikerId, setNonStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Update default teams when opened
  useEffect(() => {
    if (teams.length >= 2) {
      if (!teamAId) setTeamAId(teams[0].id);
      if (!teamBId) setTeamBId(teams[1].id);
    }
  }, [teams, teamAId, teamBId]);

  // Determine who bats first based on toss
  const battingTeamId =
    tossWinnerId === teamAId
      ? tossDecision === 'bat'
        ? teamAId
        : teamBId
      : tossWinnerId === teamBId
      ? tossDecision === 'bat'
        ? teamBId
        : teamAId
      : teamAId;

  const bowlingTeamId = battingTeamId === teamAId ? teamBId : teamAId;

  const battingTeam = teams.find((t) => t.id === battingTeamId);
  const bowlingTeam = teams.find((t) => t.id === bowlingTeamId);

  // Available batting and bowling players
  const battingPlayers = players.filter((p) => battingTeam?.playerIds.includes(p.id));
  const bowlingPlayers = players.filter((p) => bowlingTeam?.playerIds.includes(p.id));

  // Initialize toss winner and opening player defaults
  useEffect(() => {
    if (!tossWinnerId && teamAId) {
      setTossWinnerId(teamAId);
    }
  }, [teamAId, tossWinnerId]);

  useEffect(() => {
    if (battingPlayers.length >= 2) {
      if (!strikerId || !battingPlayers.some((p) => p.id === strikerId)) {
        setStrikerId(battingPlayers[0].id);
      }
      if (!nonStrikerId || !battingPlayers.some((p) => p.id === nonStrikerId) || nonStrikerId === strikerId) {
        const next = battingPlayers.find((p) => p.id !== (strikerId || battingPlayers[0].id));
        setNonStrikerId(next ? next.id : battingPlayers[1]?.id || '');
      }
    }
    if (bowlingPlayers.length > 0) {
      if (!bowlerId || !bowlingPlayers.some((p) => p.id === bowlerId)) {
        // Prefer bowler or all-rounder
        const preferredBowler =
          bowlingPlayers.find((p) => p.role === 'Bowler') ||
          bowlingPlayers.find((p) => p.role === 'All-rounder') ||
          bowlingPlayers[0];
        setBowlerId(preferredBowler?.id || '');
      }
    }
  }, [battingTeamId, bowlingTeamId, strikerId, nonStrikerId, bowlerId]);

  const handleFormatChange = (fmt: MatchFormat) => {
    setFormat(fmt);
    if (fmt === 'T10') setOvers(10);
    else if (fmt === 'T20') setOvers(20);
    else if (fmt === 'ODI') setOvers(50);
    else setOvers(15);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (teamAId === teamBId) {
      setErrorMsg('Please select two distinct teams.');
      return;
    }

    if (!strikerId || !nonStrikerId) {
      setErrorMsg('Please select both opening batsmen.');
      return;
    }

    if (strikerId === nonStrikerId) {
      setErrorMsg('Striker and Non-Striker must be different players.');
      return;
    }

    if (!bowlerId) {
      setErrorMsg('Please select the opening bowler.');
      return;
    }

    if (overs <= 0) {
      setErrorMsg('Total overs must be at least 1.');
      return;
    }

    const matchId = `match_${Date.now()}`;

    // Initialize 1st Innings
    const innings1: Innings = {
      inningsNumber: 1,
      battingTeamId,
      bowlingTeamId,
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
        [strikerId]: {
          playerId: strikerId,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          isOut: false,
        },
        [nonStrikerId]: {
          playerId: nonStrikerId,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          isOut: false,
        },
      },
      bowlerRecords: {
        [bowlerId]: {
          playerId: bowlerId,
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

    const newMatch: Match = {
      id: matchId,
      teamAId,
      teamBId,
      matchDate,
      venue: venue.trim() || 'Cyber Cricket Stadium',
      format,
      totalOvers: overs,
      tossWinnerId,
      tossDecision,
      status: 'live',
      currentInnings: 1,
      innings1,
      currentStrikerId: strikerId,
      currentNonStrikerId: nonStrikerId,
      currentBowlerId: bowlerId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onStartMatch(newMatch);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-cyber font-bold text-xl text-white">CREATE MATCH</h2>
            <p className="text-xs text-slate-400">Configure clash, overs, toss, and opening players</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleStart} className="p-6 space-y-6">
          {/* Teams Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Team A (Home)
              </label>
              <select
                value={teamAId}
                onChange={(e) => setTeamAId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id} disabled={t.id === teamBId}>
                    {t.name} ({t.playerIds.length} players)
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Team B (Away)
              </label>
              <select
                value={teamBId}
                onChange={(e) => setTeamBId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id} disabled={t.id === teamAId}>
                    {t.name} ({t.playerIds.length} players)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Match Venue, Date & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Venue
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Cyber Cricket Stadium"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
              </input>
            </div>
          </div>

          {/* Format and Overs */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
              Match Format
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['T10', 'T20', 'ODI', 'Custom'] as MatchFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => handleFormatChange(fmt)}
                  className={`py-2 px-3 rounded-xl text-xs font-cyber font-bold uppercase transition-all ${
                    format === fmt
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {fmt} {fmt === 'T10' ? '(10 ov)' : fmt === 'T20' ? '(20 ov)' : fmt === 'ODI' ? '(50 ov)' : ''}
                </button>
              ))}
            </div>

            {format === 'Custom' && (
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Custom Overs:
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={overs}
                  onChange={(e) => setOvers(Number(e.target.value))}
                  className="w-32 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono-num text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Toss Winner & Decision */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Trophy size={14} className="text-amber-400" />
              <span>Toss Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Toss Winner
                </label>
                <select
                  value={tossWinnerId}
                  onChange={(e) => setTossWinnerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={teamAId}>{teams.find((t) => t.id === teamAId)?.name || 'Team A'}</option>
                  <option value={teamBId}>{teams.find((t) => t.id === teamBId)?.name || 'Team B'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Toss Decision
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTossDecision('bat')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                      tossDecision === 'bat'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 text-slate-300 border border-slate-700'
                    }`}
                  >
                    Bat First
                  </button>
                  <button
                    type="button"
                    onClick={() => setTossDecision('bowl')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                      tossDecision === 'bowl'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 text-slate-300 border border-slate-700'
                    }`}
                  >
                    Bowl First
                  </button>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
              Batting 1st:{' '}
              <span className="text-emerald-400 font-bold">{battingTeam?.name}</span>
              <span className="mx-2">·</span>
              Bowling 1st:{' '}
              <span className="text-cyan-400 font-bold">{bowlingTeam?.name}</span>
            </div>
          </div>

          {/* Opening Players Selection */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Opening Batsmen & Opening Bowler
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-400 uppercase mb-1">
                  Striker (Batsman 1) *
                </label>
                <select
                  value={strikerId}
                  onChange={(e) => setStrikerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {battingPlayers.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.id === nonStrikerId}>
                      {formatJersey(p.jerseyNumber)} {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-400 uppercase mb-1">
                  Non-Striker (Batsman 2) *
                </label>
                <select
                  value={nonStrikerId}
                  onChange={(e) => setNonStrikerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  {battingPlayers.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.id === strikerId}>
                      {formatJersey(p.jerseyNumber)} {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cyan-400 uppercase mb-1">
                  Opening Bowler *
                </label>
                <select
                  value={bowlerId}
                  onChange={(e) => setBowlerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  {bowlingPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {formatJersey(p.jerseyNumber)} {p.name} ({p.role} · {p.bowlingStyle})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Play size={15} />
              <span>Start Match & Scoring</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
