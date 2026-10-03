import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Flame,
  Zap,
  Shield,
  Activity,
  User,
  TrendingUp,
  BarChart2,
} from 'lucide-react';
import { Player, Team, Match } from '../types/cricket';
import { calculateStrikeRate, calculateEconomy, formatJersey } from '../utils/cricketMath';

interface StatisticsDashboardProps {
  players: Player[];
  teams: Team[];
  matches: Match[];
  onSelectPlayerProfile?: (player: Player) => void;
}

export const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({
  players,
  teams,
  matches,
}) => {
  const [activeTab, setActiveTab] = useState<'runs' | 'wickets' | 'boundaries' | 'fielding'>('runs');

  // Aggregated totals across all players
  const totalCareerRuns = players.reduce((sum, p) => sum + p.stats.runs, 0);
  const totalCareerWickets = players.reduce((sum, p) => sum + p.stats.wickets, 0);
  const totalCareerFours = players.reduce((sum, p) => sum + p.stats.fours, 0);
  const totalCareerSixes = players.reduce((sum, p) => sum + p.stats.sixes, 0);

  // Top run scorers
  const topRunScorers = [...players]
    .sort((a, b) => b.stats.runs - a.stats.runs)
    .slice(0, 10);

  // Top wicket takers
  const topWicketTakers = [...players]
    .sort((a, b) => b.stats.wickets - a.stats.wickets)
    .slice(0, 10);

  // Boundary Kings
  const topBoundaryHitters = [...players]
    .sort((a, b) => b.stats.fours + b.stats.sixes * 1.5 - (a.stats.fours + a.stats.sixes * 1.5))
    .slice(0, 10);

  // Fielding Leaders
  const topFielders = [...players]
    .sort(
      (a, b) =>
        b.stats.catches + b.stats.runOuts + b.stats.stumpings -
        (a.stats.catches + a.stats.runOuts + a.stats.stumpings)
    )
    .slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-cyber font-bold text-white tracking-wide">
          STATISTICS & LEADERBOARDS
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">
          Comprehensive Cricket Analytics, Career Records, and Player Rankings
        </p>
      </div>

      {/* Aggregate Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold">Total Runs</span>
            <Trophy size={16} className="text-amber-400" />
          </div>
          <p className="font-cyber font-black text-2xl sm:text-3xl text-white font-mono-num">
            {totalCareerRuns}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Across all matches</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold">Total Wickets</span>
            <Activity size={16} className="text-teal-400" />
          </div>
          <p className="font-cyber font-black text-2xl sm:text-3xl text-teal-400 font-mono-num">
            {totalCareerWickets}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Dismissals recorded</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold">Fours (4s)</span>
            <Zap size={16} className="text-emerald-400" />
          </div>
          <p className="font-cyber font-black text-2xl sm:text-3xl text-emerald-400 font-mono-num">
            {totalCareerFours}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Rope boundaries</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold">Sixes (6s)</span>
            <Flame size={16} className="text-purple-400" />
          </div>
          <p className="font-cyber font-black text-2xl sm:text-3xl text-purple-400 font-mono-num">
            {totalCareerSixes}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Maximum clearances</span>
        </div>
      </div>

      {/* Leaderboard Category Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
        {[
          { id: 'runs', label: 'Top Run Scorers', icon: Trophy },
          { id: 'wickets', label: 'Top Wicket Takers', icon: Activity },
          { id: 'boundaries', label: 'Boundary Kings', icon: Flame },
          { id: 'fielding', label: 'Fielding Standouts', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as unknown as typeof activeTab)}
              className={`py-2.5 px-4 rounded-xl font-cyber font-bold text-xs uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {activeTab === 'runs' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold bg-slate-950/60">
                  <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                  <th className="py-3.5 px-4">Batsman</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Team</th>
                  <th className="py-3.5 px-3 text-right">Inns</th>
                  <th className="py-3.5 px-3 text-right font-bold text-white">Runs</th>
                  <th className="py-3.5 px-3 text-right">HS</th>
                  <th className="py-3.5 px-3 text-right">Avg</th>
                  <th className="py-3.5 px-3 text-right">SR</th>
                  <th className="py-3.5 px-3 text-right hidden sm:table-cell">50s</th>
                  <th className="py-3.5 px-3 text-right hidden sm:table-cell">100s</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-num">
                {topRunScorers.map((player, idx) => {
                  const avg =
                    player.stats.innings - player.stats.notOuts > 0
                      ? (
                          player.stats.runs /
                          (player.stats.innings - player.stats.notOuts)
                        ).toFixed(1)
                      : player.stats.runs.toString();
                  const sr = calculateStrikeRate(player.stats.runs, player.stats.ballsFaced);

                  return (
                    <tr key={player.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-num font-black text-xs px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                            {formatJersey(player.jerseyNumber)}
                          </span>
                          <span>{player.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-400 hidden sm:table-cell">
                        {player.teamName || 'Free Agent'}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-300">
                        {player.stats.innings}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-sm text-emerald-400">
                        {player.stats.runs}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-300">
                        {player.stats.highestScore}
                        {player.stats.highestScoreNotOut ? '*' : ''}
                      </td>
                      <td className="py-3.5 px-3 text-right font-medium text-slate-200">{avg}</td>
                      <td className="py-3.5 px-3 text-right font-medium text-teal-400">{sr}</td>
                      <td className="py-3.5 px-3 text-right text-amber-400 hidden sm:table-cell">
                        {player.stats.fifties}
                      </td>
                      <td className="py-3.5 px-3 text-right text-amber-400 hidden sm:table-cell">
                        {player.stats.hundreds}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeTab === 'wickets' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold bg-slate-950/60">
                  <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                  <th className="py-3.5 px-4">Bowler</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Style</th>
                  <th className="py-3.5 px-3 text-right">Overs</th>
                  <th className="py-3.5 px-3 text-right font-bold text-white">Wickets</th>
                  <th className="py-3.5 px-3 text-right">BBI</th>
                  <th className="py-3.5 px-3 text-right">Econ</th>
                  <th className="py-3.5 px-3 text-right hidden sm:table-cell">Maidens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-num">
                {topWicketTakers.map((player, idx) => {
                  const ovStr = (player.stats.ballsBowled / 6).toFixed(1);
                  const econ = calculateEconomy(
                    player.stats.runsConceded,
                    player.stats.ballsBowled
                  );

                  return (
                    <tr key={player.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-num font-black text-xs px-2 py-0.5 rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/30 shrink-0">
                            {formatJersey(player.jerseyNumber)}
                          </span>
                          <span>{player.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-400 hidden sm:table-cell">
                        {player.bowlingStyle}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-300">{ovStr}</td>
                      <td className="py-3.5 px-3 text-right font-black text-sm text-teal-400">
                        {player.stats.wickets}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-200">
                        {player.stats.bestBowlingWickets}/{player.stats.bestBowlingRuns}
                      </td>
                      <td className="py-3.5 px-3 text-right font-medium text-cyan-400">{econ}</td>
                      <td className="py-3.5 px-3 text-right text-slate-400 hidden sm:table-cell">
                        {player.stats.maidens}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeTab === 'boundaries' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold bg-slate-950/60">
                  <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                  <th className="py-3.5 px-4">Batsman</th>
                  <th className="py-3.5 px-3 text-right font-bold text-white">Total 4s</th>
                  <th className="py-3.5 px-3 text-right font-bold text-white">Total 6s</th>
                  <th className="py-3.5 px-3 text-right font-bold text-emerald-400">Boundary Runs</th>
                  <th className="py-3.5 px-4 text-right">SR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-num">
                {topBoundaryHitters.map((player, idx) => {
                  const boundaryRuns = player.stats.fours * 4 + player.stats.sixes * 6;
                  const sr = calculateStrikeRate(player.stats.runs, player.stats.ballsFaced);

                  return (
                    <tr key={player.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-num font-black text-xs px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                            {formatJersey(player.jerseyNumber)}
                          </span>
                          <span>{player.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-emerald-400">
                        {player.stats.fours}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-purple-400">
                        {player.stats.sixes}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-amber-400 text-sm">
                        {boundaryRuns}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-200">{sr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeTab === 'fielding' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold bg-slate-950/60">
                  <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                  <th className="py-3.5 px-4">Player</th>
                  <th className="py-3.5 px-3 text-right">Catches</th>
                  <th className="py-3.5 px-3 text-right">Run Outs</th>
                  <th className="py-3.5 px-3 text-right">Stumpings</th>
                  <th className="py-3.5 px-4 text-right font-bold text-emerald-400">Total Dismissals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-num">
                {topFielders.map((player, idx) => {
                  const totalDismissals =
                    player.stats.catches + player.stats.runOuts + player.stats.stumpings;

                  return (
                    <tr key={player.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-num font-black text-xs px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                            {formatJersey(player.jerseyNumber)}
                          </span>
                          <span>{player.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-300">
                        {player.stats.catches}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-300">
                        {player.stats.runOuts}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-300">
                        {player.stats.stumpings}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-sm text-emerald-400">
                        {totalDismissals}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
