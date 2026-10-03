import React, { useState } from 'react';
import { Trophy, Award, ArrowLeft, Printer, Share2, Calendar, MapPin, Users } from 'lucide-react';
import { Match, Team, Player, Innings } from '../types/cricket';
import {
  ballsToOversString,
  calculateStrikeRate,
  calculateEconomy,
  formatJersey,
} from '../utils/cricketMath';

interface FullScorecardProps {
  match: Match;
  teams: Team[];
  players: Player[];
  onBack: () => void;
  onResumeScoring?: () => void;
}

export const FullScorecard: React.FC<FullScorecardProps> = ({
  match,
  teams,
  players,
  onBack,
  onResumeScoring,
}) => {
  const [activeTab, setActiveTab] = useState<'inn1' | 'inn2' | 'summary'>(
    match.currentInnings === 2 ? 'inn2' : 'inn1'
  );

  const getTeam = (id: string): Team | undefined => teams.find((t) => t.id === id);
  const getPlayer = (id: string): Player | undefined => players.find((p) => p.id === id);
  const getPlayerName = (id: string): string => getPlayer(id)?.name || 'Player';
  const getPlayerDisplay = (id: string): string => {
    const p = getPlayer(id);
    return p ? `${formatJersey(p.jerseyNumber)} ${p.name}` : 'Player';
  };

  const inn1BatTeam = getTeam(match.innings1.battingTeamId);
  const inn1BowlTeam = getTeam(match.innings1.bowlingTeamId);
  const inn2BatTeam = match.innings2 ? getTeam(match.innings2.battingTeamId) : undefined;
  const inn2BowlTeam = match.innings2 ? getTeam(match.innings2.bowlingTeamId) : undefined;

  const renderInningsScorecard = (innings: Innings, batTeam?: Team, bowlTeam?: Team) => {
    const batsmanList = Object.values(innings.batsmanRecords);
    const bowlerList = Object.values(innings.bowlerRecords);

    // Identify players in batting squad who did not bat
    const battedPlayerIds = batsmanList.map((b) => b.playerId);
    const didNotBat = (batTeam?.playerIds || [])
      .filter((id) => !battedPlayerIds.includes(id))
      .map((id) => getPlayerDisplay(id));

    return (
      <div className="space-y-6">
        {/* Innings Heading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: batTeam?.logoColor || '#10b981' }}
              className="w-10 h-10 rounded-xl flex items-center justify-center font-cyber font-bold text-slate-950 text-base"
            >
              {batTeam?.shortName}
            </div>
            <div>
              <h2 className="font-cyber font-bold text-lg text-white">
                {batTeam?.name} – {innings.totalRuns}/{innings.totalWickets}
              </h2>
              <p className="text-xs text-slate-400">
                ({ballsToOversString(innings.legalBallsBowled)} of {match.totalOvers} Overs)
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase font-semibold">Run Rate</span>
            <span className="font-mono-num font-bold text-lg text-emerald-400">
              {innings.legalBallsBowled > 0
                ? ((innings.totalRuns / innings.legalBallsBowled) * 6).toFixed(2)
                : '0.00'}
            </span>
          </div>
        </div>

        {/* Batting Table (Requirement 7: Jersey column + Player + R + B + 4s + 6s + SR) */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-cyber font-bold text-xs uppercase tracking-wider text-emerald-400">
              Batting Scorecard
            </h3>
            <span className="text-[11px] text-slate-400">
              Innings {innings.inningsNumber}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-3 text-center w-16">Jersey</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Dismissal</th>
                  <th className="py-3 px-3 text-right">R</th>
                  <th className="py-3 px-3 text-right">B</th>
                  <th className="py-3 px-3 text-right">4s</th>
                  <th className="py-3 px-3 text-right">6s</th>
                  <th className="py-3 px-4 text-right">SR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-num">
                {batsmanList.map((bat) => {
                  const p = getPlayer(bat.playerId);
                  const sr = calculateStrikeRate(bat.runs, bat.balls);

                  return (
                    <tr key={bat.playerId} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono-num font-black text-xs px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {formatJersey(p?.jerseyNumber)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-white">
                        <div>
                          <span>{p?.name || bat.playerId}</span>
                          {!bat.isOut && <span className="text-emerald-400 font-bold ml-1">*</span>}
                        </div>
                        <div className="sm:hidden text-[10px] text-slate-400 font-normal mt-0.5">
                          {bat.isOut ? bat.dismissalText || 'out' : 'not out'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-400 hidden sm:table-cell">
                        {bat.isOut ? (
                          <span className="text-slate-300">{bat.dismissalText || 'out'}</span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">not out</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-white text-sm">
                        {bat.runs}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">{bat.balls}</td>
                      <td className="py-3 px-3 text-right text-slate-300">{bat.fours}</td>
                      <td className="py-3 px-3 text-right text-slate-300">{bat.sixes}</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-medium">
                        {sr.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Extras and Total Summary */}
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>
                <strong>Extras:</strong> {innings.extras.total} (wd {innings.extras.wides}, nb{' '}
                {innings.extras.noBalls}, b {innings.extras.byes}, lb {innings.extras.legByes}
                {innings.extras.penalties > 0 ? `, pen ${innings.extras.penalties}` : ''})
              </span>
            </div>

            <div className="flex items-center justify-between font-bold text-sm text-white pt-2 border-t border-slate-800">
              <span className="font-cyber uppercase tracking-wider">Total</span>
              <span className="font-mono-num text-emerald-400">
                {innings.totalRuns}/{innings.totalWickets}{' '}
                <span className="text-slate-400 text-xs font-normal">
                  ({ballsToOversString(innings.legalBallsBowled)} Overs)
                </span>
              </span>
            </div>

            {didNotBat.length > 0 && (
              <div className="pt-2 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Did not bat: </span>
                <span>{didNotBat.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Fall of Wickets */}
        {innings.fallOfWickets.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-cyber font-bold text-xs uppercase tracking-wider text-slate-300">
              Fall of Wickets
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {innings.fallOfWickets.map((fow) => (
                <span
                  key={fow.wicketNumber}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono-num text-slate-300"
                >
                  <strong className="text-rose-400">{fow.score}-{fow.wicketNumber}</strong> (
                  {fow.playerName || getPlayerDisplay(fow.playerId)}, {fow.overs} ov)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bowling Table */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-cyber font-bold text-xs uppercase tracking-wider text-cyan-400">
              Bowling Scorecard
            </h3>
            <span className="text-[11px] text-slate-400">{bowlTeam?.name}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-4">Bowler</th>
                  <th className="py-3 px-3 text-right">O</th>
                  <th className="py-3 px-3 text-right">M</th>
                  <th className="py-3 px-3 text-right">R</th>
                  <th className="py-3 px-3 text-right">W</th>
                  <th className="py-3 px-3 text-right hidden sm:table-cell">WD</th>
                  <th className="py-3 px-3 text-right hidden sm:table-cell">NB</th>
                  <th className="py-3 px-4 text-right">ECO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-num">
                {bowlerList.map((bowl) => {
                  const p = getPlayer(bowl.playerId);
                  const ovStr = ballsToOversString(bowl.legalBalls);
                  const eco = calculateEconomy(bowl.runsConceded, bowl.legalBalls);

                  return (
                    <tr key={bowl.playerId} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-num font-black text-xs px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                            {formatJersey(p?.jerseyNumber)}
                          </span>
                          <span>{p?.name || bowl.playerId}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-200">{ovStr}</td>
                      <td className="py-3 px-3 text-right text-slate-300">{bowl.maidens}</td>
                      <td className="py-3 px-3 text-right text-slate-300">{bowl.runsConceded}</td>
                      <td className="py-3 px-3 text-right font-bold text-teal-400 text-sm">
                        {bowl.wickets}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400 hidden sm:table-cell">
                        {bowl.wides}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400 hidden sm:table-cell">
                        {bowl.noBalls}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-cyan-400">
                        {eco.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {match.status === 'live' && onResumeScoring && (
            <button
              onClick={onResumeScoring}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Resume Scoring
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Print Scorecard"
          >
            <Printer size={16} />
          </button>
        </div>
      </div>

      {/* Match Result / Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="font-cyber font-bold text-emerald-400 uppercase tracking-wider">
              {match.format} · {match.totalOvers} Overs
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

          <div className="text-slate-400">
            Toss: {getTeam(match.tossWinnerId)?.name} elected to {match.tossDecision}
          </div>
        </div>

        {/* Big Clashing Teams Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <div
                style={{ backgroundColor: inn1BatTeam?.logoColor || '#10b981' }}
                className="w-10 h-10 rounded-xl flex items-center justify-center font-cyber font-black text-slate-950"
              >
                {inn1BatTeam?.shortName}
              </div>
              <div>
                <h3 className="font-cyber font-bold text-base text-white">{inn1BatTeam?.name}</h3>
                <span className="text-xs text-slate-400">1st Innings</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono-num font-black text-xl text-emerald-400">
                {match.innings1.totalRuns}/{match.innings1.totalWickets}
              </p>
              <p className="text-xs text-slate-400 font-mono-num">
                {ballsToOversString(match.innings1.legalBallsBowled)} ov
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <div
                style={{ backgroundColor: inn2BatTeam?.logoColor || '#3b82f6' }}
                className="w-10 h-10 rounded-xl flex items-center justify-center font-cyber font-black text-slate-950"
              >
                {inn2BatTeam?.shortName || inn1BowlTeam?.shortName}
              </div>
              <div>
                <h3 className="font-cyber font-bold text-base text-white">
                  {inn2BatTeam?.name || inn1BowlTeam?.name}
                </h3>
                <span className="text-xs text-slate-400">2nd Innings</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono-num font-black text-xl text-cyan-400">
                {match.innings2
                  ? `${match.innings2.totalRuns}/${match.innings2.totalWickets}`
                  : 'Did not bat'}
              </p>
              {match.innings2 && (
                <p className="text-xs text-slate-400 font-mono-num">
                  {ballsToOversString(match.innings2.legalBallsBowled)} ov
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Result summary banner */}
        {match.result && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <Trophy size={24} className="text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Result
                </span>
                <h4 className="font-cyber font-bold text-lg text-white">
                  {match.result.summaryText}
                </h4>
              </div>
            </div>

            {match.result.playerOfTheMatchName && (
              <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
                <Award size={16} className="text-amber-400 shrink-0" />
                <span>
                  POTM: <strong className="text-white">{match.result.playerOfTheMatchName}</strong>{' '}
                  ({match.result.playerOfTheMatchPerformance})
                </span>
              </div>
            )}
          </div>
        )}

        {/* MATCH MILESTONES SECTION (Requirement 17) */}
        {(() => {
          // Collect milestones from match.milestones or scan innings
          const milestonesList: {
            icon: string;
            playerId: string;
            playerName: string;
            detail: string;
            tag: string;
          }[] = [];

          if (match.milestones && match.milestones.length > 0) {
            match.milestones.forEach((m) => {
              let icon = '🏏';
              if (m.type === '100' || m.type === '150' || m.type === '200') icon = '💯';
              else if (m.type.endsWith('w')) icon = '🎯';

              const detail = m.runs !== undefined ? `${m.runs} Runs (${m.balls} balls)` : `${m.wickets} Wickets`;
              milestonesList.push({
                icon,
                playerId: m.playerId,
                playerName: m.playerName,
                detail,
                tag: m.title,
              });
            });
          } else {
            // Compute from innings 1 and innings 2
            const scanInnings = (inn?: Innings) => {
              if (!inn) return;
              Object.values(inn.batsmanRecords).forEach((b) => {
                if (b.runs >= 100) {
                  milestonesList.push({
                    icon: '💯',
                    playerId: b.playerId,
                    playerName: getPlayerName(b.playerId),
                    detail: `${b.runs} Runs (${b.balls}b, ${b.fours}×4, ${b.sixes}×6)`,
                    tag: 'Century',
                  });
                } else if (b.runs >= 50) {
                  milestonesList.push({
                    icon: '🏏',
                    playerId: b.playerId,
                    playerName: getPlayerName(b.playerId),
                    detail: `${b.runs} Runs (${b.balls}b, ${b.fours}×4, ${b.sixes}×6)`,
                    tag: 'Half Century',
                  });
                } else if (b.runs >= 30) {
                  milestonesList.push({
                    icon: '🏏',
                    playerId: b.playerId,
                    playerName: getPlayerName(b.playerId),
                    detail: `${b.runs} Runs (${b.balls}b)`,
                    tag: '30 Runs',
                  });
                }
              });

              Object.values(inn.bowlerRecords).forEach((bw) => {
                if (bw.wickets >= 5) {
                  milestonesList.push({
                    icon: '🎯',
                    playerId: bw.playerId,
                    playerName: getPlayerName(bw.playerId),
                    detail: `${bw.wickets} Wickets (${bw.runsConceded} runs)`,
                    tag: '5-Wicket Haul',
                  });
                } else if (bw.wickets === 4) {
                  milestonesList.push({
                    icon: '🎯',
                    playerId: bw.playerId,
                    playerName: getPlayerName(bw.playerId),
                    detail: `${bw.wickets} Wickets (${bw.runsConceded} runs)`,
                    tag: '4-Wicket Haul',
                  });
                } else if (bw.wickets === 3) {
                  milestonesList.push({
                    icon: '🎯',
                    playerId: bw.playerId,
                    playerName: getPlayerName(bw.playerId),
                    detail: `${bw.wickets} Wickets (${bw.runsConceded} runs)`,
                    tag: '3-Wicket Haul',
                  });
                }
              });
            };

            scanInnings(match.innings1);
            scanInnings(match.innings2);
          }

          if (milestonesList.length === 0) return null;

          return (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-amber-400" />
                <h4 className="font-cyber font-bold text-xs uppercase tracking-wider text-amber-300">
                  MATCH MILESTONES
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {milestonesList.map((ms, idx) => {
                  const p = getPlayer(ms.playerId);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3"
                    >
                      <span className="text-2xl">{ms.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          {p && (
                            <span className="font-mono-num font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700 shrink-0">
                              {formatJersey(p.jerseyNumber)}
                            </span>
                          )}
                          <p className="font-cyber font-bold text-sm text-white truncate">
                            {ms.playerName}
                          </p>
                        </div>
                        <p className="font-mono-num font-semibold text-xs text-emerald-400 mt-0.5">
                          {ms.detail}
                        </p>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wide block mt-0.5">
                          {ms.tag}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Tabs: 1st Innings, 2nd Innings */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setActiveTab('inn1')}
          className={`flex-1 py-2.5 rounded-xl font-cyber font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === 'inn1'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1st Innings ({inn1BatTeam?.shortName})
        </button>

        {match.innings2 && (
          <button
            onClick={() => setActiveTab('inn2')}
            className={`flex-1 py-2.5 rounded-xl font-cyber font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === 'inn2'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2nd Innings ({inn2BatTeam?.shortName})
          </button>
        )}
      </div>

      {/* Scorecard Tab Contents */}
      {activeTab === 'inn1' &&
        renderInningsScorecard(match.innings1, inn1BatTeam, inn1BowlTeam)}

      {activeTab === 'inn2' && match.innings2 &&
        renderInningsScorecard(match.innings2, inn2BatTeam, inn2BowlTeam)}
    </div>
  );
};
