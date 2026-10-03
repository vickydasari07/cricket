import React, { useState } from 'react';
import { Trophy, Calendar, MapPin, Trash2, ArrowRight, Activity, Search } from 'lucide-react';
import { Match, Team, Player } from '../types/cricket';
import { ballsToOversString } from '../utils/cricketMath';

interface MatchHistoryProps {
  matches: Match[];
  teams: Team[];
  players: Player[];
  onSelectScorecard: (matchId: string) => void;
  onResumeScoring: (match: Match) => void;
  onDeleteMatch: (matchId: string) => void;
  onOpenCreateMatch: () => void;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({
  matches,
  teams,
  players,
  onSelectScorecard,
  onResumeScoring,
  onDeleteMatch,
  onOpenCreateMatch,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getTeamName = (id: string) => teams.find((t) => t.id === id)?.name || 'Team';
  const getTeamShort = (id: string) => teams.find((t) => t.id === id)?.shortName || 'TM';
  const getTeamColor = (id: string) => teams.find((t) => t.id === id)?.logoColor || '#10b981';

  const filteredMatches = matches.filter((m) => {
    const teamAName = getTeamName(m.teamAId).toLowerCase();
    const teamBName = getTeamName(m.teamBId).toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      teamAName.includes(query) ||
      teamBName.includes(query) ||
      m.venue.toLowerCase().includes(query) ||
      (m.result?.playerOfTheMatchName &&
        m.result.playerOfTheMatchName.toLowerCase().includes(query));

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && m.status === 'completed') ||
      (filterStatus === 'live' && m.status === 'live');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-cyber font-bold text-white tracking-wide">
            MATCH ARCHIVES & HISTORY
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">
            {matches.length} Matches Logged in Cyber Cricket Database
          </p>
        </div>

        <button
          onClick={onOpenCreateMatch}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <span>Start New Match</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search teams, venue, player..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Matches' },
            { id: 'completed', label: 'Completed' },
            { id: 'live', label: 'In Progress' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                filterStatus === tab.id
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.map((match) => {
          const isLive = match.status === 'live';
          const teamAName = getTeamName(match.teamAId);
          const teamBName = getTeamName(match.teamBId);
          const teamAColor = getTeamColor(match.teamAId);
          const teamBColor = getTeamColor(match.teamBId);

          return (
            <div
              key={match.id}
              className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl transition-all"
            >
              {/* Meta bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  {isLive ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      LIVE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                      COMPLETED
                    </span>
                  )}

                  <span className="font-semibold text-white">
                    {match.format} ({match.totalOvers} Overs)
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {match.matchDate}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    {match.venue}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm('Delete this match from history?')) {
                        onDeleteMatch(match.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Match"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Match Score Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {/* 1st Innings */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <span
                      style={{ backgroundColor: teamAColor }}
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                    />
                    <div>
                      <h3 className="font-cyber font-bold text-sm sm:text-base text-white">
                        {teamAName}
                      </h3>
                      <span className="text-[11px] text-slate-400">1st Innings</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono-num font-black text-lg text-emerald-400">
                      {match.innings1.totalRuns}/{match.innings1.totalWickets}
                    </span>
                    <span className="text-xs text-slate-400 ml-1.5 font-mono-num">
                      ({ballsToOversString(match.innings1.legalBallsBowled)} ov)
                    </span>
                  </div>
                </div>

                {/* 2nd Innings */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <span
                      style={{ backgroundColor: teamBColor }}
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                    />
                    <div>
                      <h3 className="font-cyber font-bold text-sm sm:text-base text-white">
                        {teamBName}
                      </h3>
                      <span className="text-[11px] text-slate-400">2nd Innings</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono-num font-black text-lg text-cyan-400">
                      {match.innings2
                        ? `${match.innings2.totalRuns}/${match.innings2.totalWickets}`
                        : 'Did not bat'}
                    </span>
                    {match.innings2 && (
                      <span className="text-xs text-slate-400 ml-1.5 font-mono-num">
                        ({ballsToOversString(match.innings2.legalBallsBowled)} ov)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Result & Action */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  {match.result ? (
                    <div className="flex items-center gap-2">
                      <Trophy size={15} className="text-amber-400 shrink-0" />
                      <span className="font-bold text-white text-sm">
                        {match.result.summaryText}
                      </span>
                      {match.result.playerOfTheMatchName && (
                        <span className="text-amber-300/90 text-xs hidden md:inline ml-2">
                          · POTM: {match.result.playerOfTheMatchName} (
                          {match.result.playerOfTheMatchPerformance})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Activity size={14} className="animate-pulse" />
                      Match in progress
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {isLive && (
                    <button
                      onClick={() => onResumeScoring(match)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      Resume Scoring
                    </button>
                  )}

                  <button
                    onClick={() => onSelectScorecard(match.id)}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Full Scorecard</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMatches.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <p className="text-slate-400 text-sm">No matches found matching your filters.</p>
          <button
            onClick={onOpenCreateMatch}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs uppercase"
          >
            Start New Match
          </button>
        </div>
      )}
    </div>
  );
};
