import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  User,
  Shield,
  Activity,
  Award,
  Trophy,
  X,
  Check,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { Player, PlayerRole, BattingStyle, Team } from '../types/cricket';
import { calculateStrikeRate, calculateEconomy, formatJersey } from '../utils/cricketMath';
import { StorageService } from '../services/storage';

interface PlayerManagementProps {
  players: Player[];
  teams: Team[];
  onSavePlayer: (player: Player) => void;
  onDeletePlayer: (playerId: string) => void;
}

export const PlayerManagement: React.FC<PlayerManagementProps> = ({
  players,
  teams,
  onSavePlayer,
  onDeletePlayer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('All');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);

  // Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState<number | string>('');
  const [formJersey, setFormJersey] = useState<number | string>('');
  const [formRole, setFormRole] = useState<PlayerRole>('Batsman');
  const [formBattingStyle, setFormBattingStyle] = useState<BattingStyle>('Right Hand');
  const [formBowlingStyle, setFormBowlingStyle] = useState<string>('None');
  const [formTeamId, setFormTeamId] = useState<string>('');
  const [formColor, setFormColor] = useState<string>('#10b981');
  const [formPhotoUrl, setFormPhotoUrl] = useState<string>('');

  // Duplicate Jersey Warning State
  const [jerseyWarning, setJerseyWarning] = useState<string | null>(null);

  const openAddModal = () => {
    // Generate next player id
    const nextNum = players.length + 1;
    const autoId = `CC${nextNum.toString().padStart(3, '0')}`;
    setFormId(autoId);
    setFormName('');
    setFormAge('');
    setFormJersey(''); // Do NOT auto-assign; user must choose
    setFormRole('Batsman');
    setFormBattingStyle('Right Hand');
    setFormBowlingStyle('None');
    setFormTeamId('');
    setFormColor('#10b981');
    setFormPhotoUrl('');
    setJerseyWarning(null);
    setActivePlayer(null);
    setIsEditModalOpen(true);
  };

  const openEditModal = (player: Player) => {
    setActivePlayer(player);
    setFormId(player.id);
    setFormName(player.name);
    setFormAge(player.age);
    setFormJersey(player.jerseyNumber);
    setFormRole(player.role);
    setFormBattingStyle(player.battingStyle);
    setFormBowlingStyle(player.bowlingStyle);
    setFormTeamId(player.teamId || '');
    setFormColor(player.avatarColor || '#10b981');
    setFormPhotoUrl(player.photoUrl || '');
    setJerseyWarning(null);
    setIsProfileModalOpen(false);
    setIsEditModalOpen(true);
  };

  const openProfileModal = (player: Player) => {
    setActivePlayer(player);
    setIsProfileModalOpen(true);
  };

  // Photo upload as base64 data URL
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setFormPhotoUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setJerseyWarning(null);

    if (!formName.trim()) {
      alert('Please enter a player name.');
      return;
    }

    if (formJersey === '' || isNaN(Number(formJersey))) {
      alert('Please enter a valid jersey number (0–99).');
      return;
    }

    const jNum = Math.floor(Number(formJersey));
    if (jNum < 0 || jNum > 99) {
      alert('Jersey number must be between 0 and 99.');
      return;
    }

    // Duplicate Jersey Number Validation on the SAME TEAM
    if (formTeamId) {
      const validation = StorageService.validateJerseyNumber(jNum, formTeamId, activePlayer?.id);
      if (!validation.isValid) {
        setJerseyWarning(
          `Jersey number ${jNum} is already assigned to ${validation.conflictingPlayerName || 'another player'} on this team. Please choose another number.`
        );
        return;
      }
    }

    const matchedTeam = teams.find((t) => t.id === formTeamId);

    const playerToSave: Player = {
      id: formId.trim() || `CC${(players.length + 1).toString().padStart(3, '0')}`,
      name: formName.trim(),
      age: Number(formAge) || 24,
      jerseyNumber: jNum,
      role: formRole,
      battingStyle: formBattingStyle,
      bowlingStyle: formBowlingStyle,
      teamId: formTeamId || undefined,
      teamName: matchedTeam?.name || undefined,
      photoUrl: formPhotoUrl.trim() || undefined,
      avatarColor: formColor,
      stats: activePlayer?.stats || {
        matches: 0,
        innings: 0,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        highestScore: 0,
        highestScoreNotOut: false,
        notOuts: 0,
        fifties: 0,
        hundreds: 0,
        wickets: 0,
        ballsBowled: 0,
        runsConceded: 0,
        maidens: 0,
        bestBowlingWickets: 0,
        bestBowlingRuns: 0,
        catches: 0,
        runOuts: 0,
        stumpings: 0,
      },
    };

    onSavePlayer(playerToSave);
    setIsEditModalOpen(false);
  };

  // Filtered players with search query for player name OR jersey number
  const filteredPlayers = players.filter((p) => {
    const rawQuery = searchQuery.trim().toLowerCase();
    const cleanNumQuery = rawQuery.replace('#', '');

    const jerseyMatches =
      p.jerseyNumber.toString() === cleanNumQuery ||
      p.jerseyNumber.toString().padStart(2, '0') === cleanNumQuery;

    const nameMatches = p.name.toLowerCase().includes(rawQuery);
    const idMatches = p.id.toLowerCase().includes(rawQuery);

    const matchesSearch = rawQuery === '' || jerseyMatches || nameMatches || idMatches;
    const matchesRole = selectedRoleFilter === 'All' || p.role === selectedRoleFilter;
    const matchesTeam =
      selectedTeamFilter === 'All' ||
      (selectedTeamFilter === 'Unassigned' ? !p.teamId : p.teamId === selectedTeamFilter);

    return matchesSearch && matchesRole && matchesTeam;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-cyber font-bold text-white tracking-wide">
            CUSTOM PLAYER MANAGEMENT
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">
            {players.length} Registered Cricket Players · Custom Names & Jerseys (0–99)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>Add Custom Player</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center gap-4">
        {/* Search Input: Name or Jersey Number */}
        <div className="relative w-full md:flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="🔍 Search player name or jersey number (e.g. Rahul, 45, #07)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Role Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-semibold uppercase shrink-0">Role:</span>
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="w-full md:w-40 py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Roles</option>
            <option value="Batsman">Batsman</option>
            <option value="Bowler">Bowler</option>
            <option value="All-rounder">All-rounder</option>
            <option value="Wicket Keeper">Wicket Keeper</option>
          </select>
        </div>

        {/* Team Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-semibold uppercase shrink-0">Team:</span>
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="w-full md:w-44 py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
            <option value="Unassigned">Free Agents</option>
          </select>
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => {
          const batAvg =
            player.stats.innings - player.stats.notOuts > 0
              ? (player.stats.runs / (player.stats.innings - player.stats.notOuts)).toFixed(1)
              : player.stats.runs.toString();

          const strikeRate = calculateStrikeRate(player.stats.runs, player.stats.ballsFaced);
          const economy = calculateEconomy(player.stats.runsConceded, player.stats.ballsBowled);
          const formattedJersey = formatJersey(player.jerseyNumber);

          return (
            <div
              key={player.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Top bar with Photo/Jersey & Name */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {player.photoUrl ? (
                      <div className="relative">
                        <img
                          src={player.photoUrl}
                          alt={player.name}
                          referrerPolicy="no-referrer"
                          className="w-13 h-13 rounded-2xl object-cover border border-slate-700 shadow-md shrink-0"
                        />
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-slate-950 border border-slate-700 font-mono-num font-bold text-[10px] text-emerald-400">
                          {formattedJersey}
                        </span>
                      </div>
                    ) : (
                      <div
                        style={{ backgroundColor: player.avatarColor || '#10b981' }}
                        className="w-13 h-13 rounded-2xl flex flex-col items-center justify-center text-slate-950 font-cyber font-black text-base shadow-md shrink-0 border border-white/20"
                      >
                        <span className="font-mono-num">{formattedJersey}</span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        {/* Jersey Number Visually Distinct */}
                        <span className="font-mono-num font-black text-sm px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          {formattedJersey}
                        </span>
                        <h3 className="font-cyber font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                          {player.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="font-mono-num text-slate-500 text-[11px]">{player.id}</span>
                        <span>·</span>
                        <span className="font-semibold text-slate-300">{player.role}</span>
                        <span>·</span>
                        <span>Age {player.age}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team & Style tags */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Team:</span>
                    <span className="text-slate-200 font-semibold">
                      {player.teamName || 'Free Agent'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Batting Style:</span>
                    <span className="text-slate-300">{player.battingStyle}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Bowling Style:</span>
                    <span className="text-slate-300">{player.bowlingStyle}</span>
                  </div>
                </div>

                {/* Career Quick Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/50 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Runs</span>
                    <p className="font-mono-num font-bold text-sm text-emerald-400">
                      {player.stats.runs}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Wickets</span>
                    <p className="font-mono-num font-bold text-sm text-teal-400">
                      {player.stats.wickets}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Matches</span>
                    <p className="font-mono-num font-bold text-sm text-slate-200">
                      {player.stats.matches}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => openProfileModal(player)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <User size={13} className="text-emerald-400" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => openEditModal(player)}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                  title="Edit Player"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete player ${player.name} (${formattedJersey})?`)) {
                      onDeletePlayer(player.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete Player"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <p className="text-slate-400 text-sm">No players found matching your search or filters.</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs uppercase"
          >
            Add Custom Player
          </button>
        </div>
      )}

      {/* Edit / Add Custom Player Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-cyber font-bold text-lg text-white">
                  {activePlayer ? 'EDIT PLAYER' : 'ADD CUSTOM PLAYER'}
                </h2>
                <p className="text-xs text-slate-400">
                  Custom player details, jersey number (0–99), and role
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Warning Message for duplicate jersey number on same team */}
            {jerseyWarning && (
              <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-300 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle size={18} className="text-amber-400" />
                  <span>⚠️ Jersey Number Already Used</span>
                </div>
                <p className="text-xs leading-relaxed">{jerseyWarning}</p>
              </div>
            )}

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Player Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter any player name..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-400 uppercase mb-1">
                    Jersey Number (0–99) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono-num font-bold text-slate-400">
                      #
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      required
                      placeholder="e.g. 07, 18, 99"
                      value={formJersey}
                      onChange={(e) => {
                        setFormJersey(e.target.value);
                        setJerseyWarning(null);
                      }}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono-num font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Choose any number between 0 and 99.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Player ID
                  </label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    disabled={!!activePlayer}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono-num text-slate-300 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="65"
                    placeholder="25"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Role
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as PlayerRole)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-rounder">All-rounder</option>
                    <option value="Wicket Keeper">Wicket Keeper</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Batting Style
                  </label>
                  <select
                    value={formBattingStyle}
                    onChange={(e) => setFormBattingStyle(e.target.value as BattingStyle)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Right Hand">Right Hand</option>
                    <option value="Left Hand">Left Hand</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Bowling Style
                  </label>
                  <select
                    value={formBowlingStyle}
                    onChange={(e) => setFormBowlingStyle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="None">None</option>
                    <option value="Right-arm Fast">Right-arm Fast</option>
                    <option value="Right-arm Medium">Right-arm Medium</option>
                    <option value="Right-arm Off-Spin">Right-arm Off-Spin</option>
                    <option value="Right-arm Leg-Spin">Right-arm Leg-Spin</option>
                    <option value="Left-arm Fast">Left-arm Fast</option>
                    <option value="Left-arm Medium">Left-arm Medium</option>
                    <option value="Left-arm Orthodox">Left-arm Orthodox</option>
                    <option value="Left-arm Chinaman">Left-arm Chinaman</option>
                  </select>
                </div>
              </div>

              {/* Team Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Team Membership
                  </label>
                  <select
                    value={formTeamId}
                    onChange={(e) => {
                      setFormTeamId(e.target.value);
                      setJerseyWarning(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">No Team (Free Agent)</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Badge Color */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Avatar / Badge Color
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {['#10b981', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#f43f5e'].map(
                      (color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormColor(color)}
                          style={{ backgroundColor: color }}
                          className={`w-7 h-7 rounded-lg transition-transform ${
                            formColor === color ? 'scale-110 ring-2 ring-white shadow-md' : 'opacity-70'
                          }`}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Player Photo (Upload or URL) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase">
                  Player Photo (Upload or URL)
                </label>
                <div className="flex items-center gap-3">
                  {formPhotoUrl ? (
                    <img
                      src={formPhotoUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                      <ImageIcon size={20} />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      placeholder="Paste Image URL..."
                      value={formPhotoUrl}
                      onChange={(e) => setFormPhotoUrl(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer flex items-center gap-1.5">
                        <Upload size={12} />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                      </label>

                      {formPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormPhotoUrl('')}
                          className="text-[11px] text-rose-400 hover:underline"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider"
                >
                  {activePlayer ? 'SAVE CHANGES' : 'SAVE PLAYER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Player Profile Modal */}
      {isProfileModalOpen && activePlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 relative">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors absolute top-5 right-5"
              >
                <X size={16} />
              </button>

              <div className="text-center pb-2">
                <span className="text-[11px] font-cyber font-bold tracking-widest text-emerald-400 uppercase">
                  PLAYER PROFILE
                </span>
              </div>

              {/* Photo & Jersey */}
              <div className="flex flex-col items-center justify-center mt-2 space-y-3">
                {activePlayer.photoUrl ? (
                  <div className="relative">
                    <img
                      src={activePlayer.photoUrl}
                      alt={activePlayer.name}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-xl"
                    />
                    <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg bg-slate-950 border border-emerald-500/60 font-mono-num font-black text-xs text-emerald-400 shadow-md">
                      {formatJersey(activePlayer.jerseyNumber)}
                    </span>
                  </div>
                ) : (
                  <div
                    style={{ backgroundColor: activePlayer.avatarColor || '#10b981' }}
                    className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center text-slate-950 font-cyber font-black text-3xl shadow-xl border-2 border-white/20"
                  >
                    <span className="font-mono-num">{formatJersey(activePlayer.jerseyNumber)}</span>
                  </div>
                )}

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono-num font-black text-base px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      {formatJersey(activePlayer.jerseyNumber)}
                    </span>
                    <h2 className="font-cyber font-bold text-2xl text-white">
                      {activePlayer.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 font-mono-num mt-1">ID: {activePlayer.id}</p>
                </div>
              </div>
            </div>

            {/* Profile Details List (matches user spec) */}
            <div className="p-6 space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400 font-semibold uppercase">Role:</span>
                  <span className="text-white font-bold">{activePlayer.role}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400 font-semibold uppercase">Batting:</span>
                  <span className="text-slate-200">{activePlayer.battingStyle}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400 font-semibold uppercase">Bowling:</span>
                  <span className="text-slate-200">{activePlayer.bowlingStyle}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400 font-semibold uppercase">Team:</span>
                  <span className="text-emerald-400 font-semibold">
                    {activePlayer.teamName || 'Free Agent'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 font-semibold uppercase">Age:</span>
                  <span className="text-slate-200">{activePlayer.age}</span>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="space-y-3">
                <h3 className="font-cyber font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Activity size={14} className="text-emerald-400" />
                  <span>Player Statistics</span>
                </h3>

                {(() => {
                  const batAvg =
                    activePlayer.stats.innings - activePlayer.stats.notOuts > 0
                      ? (
                          activePlayer.stats.runs /
                          (activePlayer.stats.innings - activePlayer.stats.notOuts)
                        ).toFixed(1)
                      : activePlayer.stats.runs.toString();

                  const strikeRate = calculateStrikeRate(
                    activePlayer.stats.runs,
                    activePlayer.stats.ballsFaced
                  );

                  const economy = calculateEconomy(
                    activePlayer.stats.runsConceded,
                    activePlayer.stats.ballsBowled
                  );

                  return (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono-num">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 font-sans">Matches:</span>
                        <span className="font-bold text-white text-sm">
                          {activePlayer.stats.matches}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 font-sans">Runs:</span>
                        <span className="font-bold text-emerald-400 text-sm">
                          {activePlayer.stats.runs}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 font-sans">Highest Score:</span>
                        <span className="font-bold text-white text-sm">
                          {activePlayer.stats.highestScore}
                          {activePlayer.stats.highestScoreNotOut ? '*' : ''}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 font-sans">Wickets:</span>
                        <span className="font-bold text-teal-400 text-sm">
                          {activePlayer.stats.wickets}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 font-sans">Best Bowling:</span>
                        <span className="font-bold text-white text-sm">
                          {activePlayer.stats.bestBowlingWickets}/
                          {activePlayer.stats.bestBowlingRuns}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 font-sans">Batting Avg:</span>
                        <span className="font-bold text-emerald-400 text-sm">{batAvg}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 font-sans">Strike Rate:</span>
                        <span className="font-bold text-emerald-400 text-sm">{strikeRate}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 font-sans">Economy:</span>
                        <span className="font-bold text-cyan-400 text-sm">{economy}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Role Specific Milestone Trackers (Requirement 4) */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2.5">
                  <h4 className="font-cyber font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Trophy size={13} />
                    <span>Role Milestones & Career Records ({activePlayer.role})</span>
                  </h4>

                  {/* Batsman & All-rounder Batting Milestones: 30s, 50s, 100s, 150s, 200s, 4s, 6s */}
                  {(activePlayer.role === 'Batsman' || activePlayer.role === 'All-rounder') && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase">
                        <span>🏏 Batting Milestones:</span>
                        <span className="font-mono-num text-slate-300">
                          {activePlayer.stats.fours} 4s · {activePlayer.stats.sixes} 6s
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-semibold">30s</span>
                          <span className="font-mono-num font-bold text-white text-sm">
                            {activePlayer.stats.thirties ?? (activePlayer.stats.runs >= 30 ? Math.floor(activePlayer.stats.runs / 70) + 1 : 0)}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-teal-400 block font-semibold">50s</span>
                          <span className="font-mono-num font-bold text-teal-300 text-sm">
                            {activePlayer.stats.fifties}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-amber-400 block font-semibold">100s</span>
                          <span className="font-mono-num font-bold text-amber-300 text-sm">
                            {activePlayer.stats.hundreds}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-yellow-300 block font-semibold">150s</span>
                          <span className="font-mono-num font-bold text-yellow-200 text-sm">
                            {activePlayer.stats.oneFifties ?? 0}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-purple-400 block font-semibold">200s</span>
                          <span className="font-mono-num font-bold text-purple-300 text-sm">
                            {activePlayer.stats.twoHundreds ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bowler & All-rounder Bowling Milestones: 3w, 4w, 5w, 10w, Overs, Maidens */}
                  {(activePlayer.role === 'Bowler' || activePlayer.role === 'All-rounder') && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase">
                        <span>🎯 Bowling Milestones:</span>
                        <span className="font-mono-num text-slate-300">
                          {(activePlayer.stats.ballsBowled / 6).toFixed(1)} Overs · {activePlayer.stats.maidens} Maidens
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-semibold">3w Hauls</span>
                          <span className="font-mono-num font-bold text-white text-sm">
                            {activePlayer.stats.threeWickets ?? (activePlayer.stats.wickets >= 3 ? Math.floor(activePlayer.stats.wickets / 6) + 1 : 0)}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-rose-400 block font-semibold">4w Hauls</span>
                          <span className="font-mono-num font-bold text-rose-300 text-sm">
                            {activePlayer.stats.fourWickets ?? (activePlayer.stats.bestBowlingWickets >= 4 ? 1 : 0)}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-rose-500 block font-semibold">5w Hauls</span>
                          <span className="font-mono-num font-bold text-rose-400 text-sm">
                            {activePlayer.stats.fiveWickets ?? (activePlayer.stats.bestBowlingWickets >= 5 ? 1 : 0)}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-amber-400 block font-semibold">10w Match</span>
                          <span className="font-mono-num font-bold text-amber-300 text-sm">
                            {activePlayer.stats.tenWickets ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wicket Keeper: Catches, Stumpings, Total Dismissals */}
                  {activePlayer.role === 'Wicket Keeper' && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                        🧤 Keeping & Dismissals:
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Catches</span>
                          <span className="font-mono-num font-bold text-emerald-400 text-base">
                            {activePlayer.stats.catches}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-indigo-400 block uppercase font-semibold">Stumpings</span>
                          <span className="font-mono-num font-bold text-indigo-300 text-base">
                            {activePlayer.stats.stumpings}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-amber-400 block uppercase font-semibold">Total Dismissals</span>
                          <span className="font-mono-num font-bold text-amber-300 text-base">
                            {activePlayer.stats.catches + activePlayer.stats.stumpings}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => openEditModal(activePlayer)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Edit2 size={13} />
                <span>EDIT PLAYER</span>
              </button>

              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
