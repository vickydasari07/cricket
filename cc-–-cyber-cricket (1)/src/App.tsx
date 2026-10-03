import React, { useState, useEffect } from 'react';
import { Navbar, NavView } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { PlayerManagement } from './components/PlayerManagement';
import { TeamManagement } from './components/TeamManagement';
import { CreateMatchModal } from './components/CreateMatchModal';
import { LiveScoring } from './components/LiveScoring';
import { FullScorecard } from './components/FullScorecard';
import { MatchHistory } from './components/MatchHistory';
import { StatisticsDashboard } from './components/StatisticsDashboard';
import { SettingsModal } from './components/SettingsModal';
import { StorageService } from './services/storage';
import { Match, Player, Team } from './types/cricket';
import { ballsToOversString } from './utils/cricketMath';

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>('home');
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [selectedScorecardMatchId, setSelectedScorecardMatchId] = useState<string | null>(null);

  // Modals
  const [isCreateMatchModalOpen, setIsCreateMatchModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    const loadedPlayers = StorageService.getPlayers();
    const loadedTeams = StorageService.getTeams();
    const loadedMatches = StorageService.getMatches();

    setPlayers(loadedPlayers);
    setTeams(loadedTeams);
    setMatches(loadedMatches);

    // Check active live match
    const activeId = StorageService.getActiveMatchId();
    if (activeId) {
      const match = loadedMatches.find((m) => m.id === activeId);
      if (match && match.status === 'live') {
        setActiveMatch(match);
      } else {
        // Fallback to any live match
        const anyLive = loadedMatches.find((m) => m.status === 'live');
        if (anyLive) {
          setActiveMatch(anyLive);
          StorageService.setActiveMatchId(anyLive.id);
        } else {
          setActiveMatch(null);
          StorageService.clearActiveMatchId();
        }
      }
    } else {
      const anyLive = loadedMatches.find((m) => m.status === 'live');
      if (anyLive) {
        setActiveMatch(anyLive);
        StorageService.setActiveMatchId(anyLive.id);
      }
    }
  };

  // Player handlers
  const handleSavePlayer = (player: Player) => {
    StorageService.savePlayer(player);
    setPlayers(StorageService.getPlayers());
  };

  const handleDeletePlayer = (playerId: string) => {
    StorageService.deletePlayer(playerId);
    setPlayers(StorageService.getPlayers());
  };

  // Team handlers
  const handleSaveTeam = (team: Team) => {
    StorageService.saveTeam(team);
    setTeams(StorageService.getTeams());
  };

  const handleDeleteTeam = (teamId: string) => {
    StorageService.deleteTeam(teamId);
    setTeams(StorageService.getTeams());
  };

  // Match creation handler
  const handleStartNewMatch = (newMatch: Match) => {
    StorageService.saveMatch(newMatch);
    StorageService.setActiveMatchId(newMatch.id);
    setActiveMatch(newMatch);
    setMatches(StorageService.getMatches());
    setIsCreateMatchModalOpen(false);
    setCurrentView('live');
  };

  // Match live update handler
  const handleUpdateMatch = (updatedMatch: Match) => {
    StorageService.saveMatch(updatedMatch);
    setActiveMatch(updatedMatch);
    setMatches(StorageService.getMatches());

    // If match was completed, update career stats for all players involved!
    if (updatedMatch.status === 'completed') {
      StorageService.clearActiveMatchId();
      updatePlayerCareerStats(updatedMatch);
    }
  };

  // Helper to sync completed match numbers into player career stats
  const updatePlayerCareerStats = (completedMatch: Match) => {
    const allPlayers = StorageService.getPlayers();
    const updatedPlayers = allPlayers.map((player) => {
      const p = { ...player, stats: { ...player.stats } };

      const checkInnings = (inn: typeof completedMatch.innings1) => {
        // Batting
        const batRec = inn.batsmanRecords[p.id];
        if (batRec) {
          p.stats.innings += 1;
          p.stats.runs += batRec.runs;
          p.stats.ballsFaced += batRec.balls;
          p.stats.fours += batRec.fours;
          p.stats.sixes += batRec.sixes;
          if (batRec.runs >= 100) p.stats.hundreds += 1;
          else if (batRec.runs >= 50) p.stats.fifties += 1;
          if (!batRec.isOut) p.stats.notOuts += 1;
          if (batRec.runs > p.stats.highestScore) {
            p.stats.highestScore = batRec.runs;
            p.stats.highestScoreNotOut = !batRec.isOut;
          }
        }

        // Bowling
        const bowlRec = inn.bowlerRecords[p.id];
        if (bowlRec) {
          p.stats.ballsBowled += bowlRec.legalBalls;
          p.stats.runsConceded += bowlRec.runsConceded;
          p.stats.wickets += bowlRec.wickets;
          p.stats.maidens += bowlRec.maidens;
          if (
            bowlRec.wickets > p.stats.bestBowlingWickets ||
            (bowlRec.wickets === p.stats.bestBowlingWickets &&
              bowlRec.runsConceded < p.stats.bestBowlingRuns)
          ) {
            p.stats.bestBowlingWickets = bowlRec.wickets;
            p.stats.bestBowlingRuns = bowlRec.runsConceded;
          }
        }
      };

      const isParticipant =
        completedMatch.innings1.battingTeamId === p.teamId ||
        completedMatch.innings1.bowlingTeamId === p.teamId;

      if (isParticipant) {
        p.stats.matches += 1;
        checkInnings(completedMatch.innings1);
        if (completedMatch.innings2) {
          checkInnings(completedMatch.innings2);
        }
      }

      return p;
    });

    localStorage.setItem('cc_cyber_cricket_players_v1', JSON.stringify(updatedPlayers));
    setPlayers(updatedPlayers);
  };

  const handleDeleteMatch = (matchId: string) => {
    StorageService.deleteMatch(matchId);
    if (activeMatch?.id === matchId) {
      setActiveMatch(null);
    }
    setMatches(StorageService.getMatches());
  };

  const handleSelectScorecard = (matchId: string) => {
    setSelectedScorecardMatchId(matchId);
    setCurrentView('scorecard');
  };

  const handleResumeMatch = (match: Match) => {
    setActiveMatch(match);
    StorageService.setActiveMatchId(match.id);
    setCurrentView('live');
  };

  // Export JSON Backup
  const handleExportData = () => {
    const json = StorageService.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cc_cyber_cricket_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportData = (jsonStr: string): boolean => {
    const success = StorageService.importAllData(jsonStr);
    if (success) {
      loadAllData();
    }
    return success;
  };

  // Reset to default sample match and teams
  const handleResetToSampleData = () => {
    StorageService.resetToSampleData();
    loadAllData();
  };

  // Build active match summary ticker string
  let activeMatchSummary = '';
  if (activeMatch) {
    const batTeamName =
      teams.find(
        (t) =>
          t.id ===
          (activeMatch.currentInnings === 1
            ? activeMatch.innings1.battingTeamId
            : activeMatch.innings2?.battingTeamId)
      )?.shortName || 'BAT';
    const curInnings =
      activeMatch.currentInnings === 1 ? activeMatch.innings1 : activeMatch.innings2!;
    activeMatchSummary = `${batTeamName} ${curInnings.totalRuns}/${
      curInnings.totalWickets
    } (${ballsToOversString(curInnings.legalBallsBowled)} ov)`;
  }

  const scorecardMatch = selectedScorecardMatchId
    ? matches.find((m) => m.id === selectedScorecardMatchId) || activeMatch || matches[0]
    : activeMatch || matches[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Top Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'live' && !activeMatch && matches.length > 0) {
            // Find live or latest match
            const liveM = matches.find((m) => m.status === 'live');
            if (liveM) {
              setActiveMatch(liveM);
            }
          }
          setCurrentView(view);
        }}
        hasActiveMatch={!!activeMatch}
        activeMatchSummary={activeMatchSummary}
        onOpenCreateMatch={() => setIsCreateMatchModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {currentView === 'home' && (
          <HomeScreen
            onNavigate={setCurrentView}
            onOpenCreateMatch={() => setIsCreateMatchModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onSelectMatchScorecard={handleSelectScorecard}
            activeMatch={activeMatch}
            recentMatches={matches}
            players={players}
            teams={teams}
          />
        )}

        {currentView === 'live' && activeMatch && (
          <LiveScoring
            match={activeMatch}
            teams={teams}
            players={players}
            onUpdateMatch={handleUpdateMatch}
            onViewScorecard={handleSelectScorecard}
            onBackToHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'live' && !activeMatch && (
          <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              🏏
            </div>
            <h2 className="font-cyber font-bold text-2xl text-white">No Live Match In Progress</h2>
            <p className="text-slate-400 text-sm">
              Create a match or open an existing clash from Match History to begin scoring.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setIsCreateMatchModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider"
              >
                Create New Match
              </button>
              <button
                onClick={() => setCurrentView('matches')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                View Match Archives
              </button>
            </div>
          </div>
        )}

        {currentView === 'players' && (
          <PlayerManagement
            players={players}
            teams={teams}
            onSavePlayer={handleSavePlayer}
            onDeletePlayer={handleDeletePlayer}
          />
        )}

        {currentView === 'teams' && (
          <TeamManagement
            teams={teams}
            players={players}
            onSaveTeam={handleSaveTeam}
            onDeleteTeam={handleDeleteTeam}
            onSavePlayer={handleSavePlayer}
          />
        )}

        {currentView === 'matches' && (
          <MatchHistory
            matches={matches}
            teams={teams}
            players={players}
            onSelectScorecard={handleSelectScorecard}
            onResumeScoring={handleResumeMatch}
            onDeleteMatch={handleDeleteMatch}
            onOpenCreateMatch={() => setIsCreateMatchModalOpen(true)}
          />
        )}

        {currentView === 'stats' && (
          <StatisticsDashboard players={players} teams={teams} matches={matches} />
        )}

        {currentView === 'scorecard' && scorecardMatch && (
          <FullScorecard
            match={scorecardMatch}
            teams={teams}
            players={players}
            onBack={() => setCurrentView('matches')}
            onResumeScoring={
              scorecardMatch.status === 'live'
                ? () => {
                    setActiveMatch(scorecardMatch);
                    setCurrentView('live');
                  }
                : undefined
            }
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p className="font-cyber tracking-wider font-semibold text-slate-400">
          CC – CYBER CRICKET
        </p>
        <p className="mt-1">“Your Cricket. Your Score. Your Game.”</p>
      </footer>

      {/* Create Match Modal */}
      <CreateMatchModal
        isOpen={isCreateMatchModalOpen}
        onClose={() => setIsCreateMatchModalOpen(false)}
        teams={teams}
        players={players}
        onStartMatch={handleStartNewMatch}
      />

      {/* Settings & Sample Data Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onResetToSampleData={handleResetToSampleData}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />
    </div>
  );
}
