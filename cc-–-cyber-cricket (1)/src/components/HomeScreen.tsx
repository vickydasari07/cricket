import React from 'react';
import {
  Play,
  Users,
  Shield,
  History,
  BarChart3,
  Settings,
  PlusCircle,
  Trophy,
  ArrowRight,
  Flame,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { Match, Player, Team } from '../types/cricket';
import { NavView } from './Navbar';
import { ballsToOversString } from '../utils/cricketMath';

interface HomeScreenProps {
  onNavigate: (view: NavView) => void;
  onOpenCreateMatch: () => void;
  onOpenSettings: () => void;
  onSelectMatchScorecard: (matchId: string) => void;
  activeMatch?: Match | null;
  recentMatches: Match[];
  players: Player[];
  teams: Team[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onOpenCreateMatch,
  onOpenSettings,
  onSelectMatchScorecard,
  activeMatch,
  recentMatches,
  players,
  teams,
}) => {
  const getTeamName = (teamId: string) => {
    return teams.find((t) => t.id === teamId)?.name || 'Team';
  };

  const getTeamShort = (teamId: string) => {
    return teams.find((t) => t.id === teamId)?.shortName || 'TM';
  };

  const completedMatches = recentMatches.filter((m) => m.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800/80 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center font-cyber font-extrabold text-slate-950 text-3xl shadow-xl shadow-emerald-500/25">
                CC
              </div>
              <div>
                <h1 className="font-cyber text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  CYBER CRICKET
                </h1>
                <p className="text-emerald-400 font-semibold text-xs sm:text-sm tracking-wider uppercase">
                  Your Cricket · Your Score · Your Game
                </p>
              </div>
            </div>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Professional, modern cricket scoring engine with real-time ball-by-ball entry,
              automatic strike & over rotation, comprehensive statistics, and match archives.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={onOpenCreateMatch}
              className="flex-1 md:flex-initial px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-cyber font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <PlusCircle size={18} />
              <span>Create Match</span>
            </button>

            {activeMatch && (
              <button
                onClick={() => onNavigate('live')}
                className="flex-1 md:flex-initial px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 font-cyber font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Activity size={18} className="text-emerald-400 animate-pulse" />
                <span>Resume Scoring</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Live Match Spotlight (If ongoing) */}
      {activeMatch && (
        <div className="rounded-2xl bg-slate-900/90 border border-emerald-500/30 p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Match In Progress
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400 font-medium">
                {activeMatch.format} ({activeMatch.totalOvers} Overs)
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400 font-medium">{activeMatch.venue}</span>
            </div>

            <button
              onClick={() => onNavigate('live')}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <span>Scoreboard Pad</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Quick live score banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">1st Innings</p>
              <p className="text-lg font-cyber font-bold text-white">
                {getTeamName(activeMatch.innings1.battingTeamId)}:{' '}
                <span className="font-mono-num text-emerald-400">
                  {activeMatch.innings1.totalRuns}/{activeMatch.innings1.totalWickets}
                </span>{' '}
                <span className="text-xs text-slate-400">
                  ({ballsToOversString(activeMatch.innings1.legalBallsBowled)} ov)
                </span>
              </p>
            </div>

            {activeMatch.currentInnings === 2 && activeMatch.innings2 && (
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">2nd Innings (Chase)</p>
                <p className="text-lg font-cyber font-bold text-white">
                  {getTeamName(activeMatch.innings2.battingTeamId)}:{' '}
                  <span className="font-mono-num text-cyan-400">
                    {activeMatch.innings2.totalRuns}/{activeMatch.innings2.totalWickets}
                  </span>{' '}
                  <span className="text-xs text-slate-400">
                    ({ballsToOversString(activeMatch.innings2.legalBallsBowled)} ov)
                  </span>
                </p>
                {activeMatch.target && (
                  <p className="text-xs text-amber-300 font-medium">
                    Target: {activeMatch.target} (Need{' '}
                    {Math.max(0, activeMatch.target - activeMatch.innings2.totalRuns)} runs)
                  </p>
                )}
              </div>
            )}

            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Toss</p>
              <p className="text-sm text-slate-200">
                {getTeamName(activeMatch.tossWinnerId)} elected to {activeMatch.tossDecision}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Hub Action Cards (6 Grid items requested by user) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-cyber">
            Control Center
          </h2>
          <span className="text-xs text-slate-500">Fast Navigation</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* 1. Create Match */}
          <button
            onClick={onOpenCreateMatch}
            className="group p-4 sm:p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-left transition-all hover:-translate-y-1 focus-visible:outline-none"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
              <PlusCircle size={22} />
            </div>
            <h3 className="font-cyber font-bold text-sm sm:text-base text-white group-hover:text-emerald-400 transition-colors">
              Create Match
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">Setup & toss</p>
          </button>

          {/* 2. Players */}
          <button
            onClick={() => onNavigate('players')}
            className="group p-4 sm:p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/50 text-left transition-all hover:-translate-y-1 focus-visible:outline-none"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3 group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
              <Users size={22} />
            </div>
            <h3 className="font-cyber font-bold text-sm sm:text-base text-white group-hover:text-teal-400 transition-colors">
              Players
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{players.length} registered</p>
          </button>

          {/* 3. Teams */}
          <button
            onClick={() => onNavigate('teams')}
            className="group p-4 sm:p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-left transition-all hover:-translate-y-1 focus-visible:outline-none"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
              <Shield size={22} />
            </div>
            <h3 className="font-cyber font-bold text-sm sm:text-base text-white group-hover:text-cyan-400 transition-colors">
              Teams
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{teams.length} clubs</p>
          </button>

          {/* 4. Match History */}
          <button
            onClick={() => onNavigate('matches')}
            className="group p-4 sm:p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 text-left transition-all hover:-translate-y-1 focus-visible:outline-none"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:bg-blue-500 group-hover:text-slate-950 transition-colors">
              <History size={22} />
            </div>
            <h3 className="font-cyber font-bold text-sm sm:text-base text-white group-hover:text-blue-400 transition-colors">
              Match History
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              {recentMatches.length} matches
            </p>
          </button>

          {/* 5. Statistics */}
          <button
            onClick={() => onNavigate('stats')}
            className="group p-4 sm:p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 text-left transition-all hover:-translate-y-1 focus-visible:outline-none"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-colors">
              <BarChart3 size={22} />
            </div>
            <h3 className="font-cyber font-bold text-sm sm:text-base text-white group-hover:text-indigo-400 transition-colors">
              Statistics
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">Leaderboards</p>
          </button>

          {/* 6. Settings */}
          <button
            onClick={onOpenSettings}
            className="group p-4 sm:p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-500/50 text-left transition-all hover:-translate-y-1 focus-visible:outline-none"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 mb-3 group-hover:bg-slate-700 group-hover:text-white transition-colors">
              <Settings size={22} />
            </div>
            <h3 className="font-cyber font-bold text-sm sm:text-base text-white group-hover:text-slate-200 transition-colors">
              Settings
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">Data & Audio</p>
          </button>
        </div>
      </div>

      {/* Featured Sample / Recent Match Highlight */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-cyber">
              Recent Match Highlights
            </h2>
          </div>
          <button
            onClick={() => onNavigate('matches')}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View All ({recentMatches.length})</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {completedMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedMatches.slice(0, 2).map((match) => {
              const teamAName = getTeamName(match.teamAId);
              const teamBName = getTeamName(match.teamBId);
              const teamAShort = getTeamShort(match.teamAId);
              const teamBShort = getTeamShort(match.teamBId);

              return (
                <div
                  key={match.id}
                  onClick={() => onSelectMatchScorecard(match.id)}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-lg"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
                    <span className="font-semibold text-emerald-400">
                      {match.format} · {match.totalOvers} Overs
                    </span>
                    <span>{match.matchDate}</span>
                  </div>

                  {/* Teams & Scores */}
                  <div className="py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {teamAShort}
                        </div>
                        <span className="font-semibold text-white text-sm sm:text-base">
                          {teamAName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono-num font-bold text-base sm:text-lg text-white">
                          {match.innings1.totalRuns}/{match.innings1.totalWickets}
                        </span>
                        <span className="text-xs text-slate-400 ml-1.5">
                          ({ballsToOversString(match.innings1.legalBallsBowled)} ov)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                          {teamBShort}
                        </div>
                        <span className="font-semibold text-white text-sm sm:text-base">
                          {teamBName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono-num font-bold text-base sm:text-lg text-white">
                          {match.innings2 ? `${match.innings2.totalRuns}/${match.innings2.totalWickets}` : 'Did not bat'}
                        </span>
                        {match.innings2 && (
                          <span className="text-xs text-slate-400 ml-1.5">
                            ({ballsToOversString(match.innings2.legalBallsBowled)} ov)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Result & POTM */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <p className="font-semibold text-emerald-400">
                      🏆 {match.result?.summaryText || 'Match Completed'}
                    </p>
                    <span className="text-slate-400 group-hover:text-white flex items-center gap-1">
                      Scorecard &rarr;
                    </span>
                  </div>

                  {match.result?.playerOfTheMatchName && (
                    <div className="mt-2 text-[11px] text-amber-300/90 font-medium">
                      POTM: {match.result.playerOfTheMatchName} (
                      {match.result.playerOfTheMatchPerformance})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
            <p className="text-slate-400 text-sm">No matches played yet.</p>
            <button
              onClick={onOpenCreateMatch}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs uppercase"
            >
              Start First Match
            </button>
          </div>
        )}
      </div>

      {/* Quick Cricket Statistics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Players</p>
          <p className="font-cyber text-2xl font-bold text-white mt-1">{players.length}</p>
          <span className="text-[10px] text-emerald-400">Database Ready</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Teams</p>
          <p className="font-cyber text-2xl font-bold text-white mt-1">{teams.length}</p>
          <span className="text-[10px] text-teal-400">Custom Squads</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-xs text-slate-400 uppercase font-semibold">Matches Scored</p>
          <p className="font-cyber text-2xl font-bold text-white mt-1">{recentMatches.length}</p>
          <span className="text-[10px] text-cyan-400">Saved in Storage</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-xs text-slate-400 uppercase font-semibold">Scoring Engine</p>
          <p className="font-cyber text-2xl font-bold text-emerald-400 mt-1">ICC / MCC</p>
          <span className="text-[10px] text-slate-400">Ball-by-Ball Live</span>
        </div>
      </div>
    </div>
  );
};
