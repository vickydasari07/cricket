import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Shield,
  Award,
  X,
  Check,
  Search,
  Copy,
  Eye,
  Upload,
  Activity,
  Trophy,
  Flame,
  AlertTriangle,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Team, Player, PlayerRole, BattingStyle, TeamStats } from '../types/cricket';
import { formatJersey } from '../utils/cricketMath';
import { StorageService } from '../services/storage';

interface TeamManagementProps {
  teams: Team[];
  players: Player[];
  onSaveTeam: (team: Team) => void;
  onDeleteTeam: (teamId: string) => void;
  onSavePlayer: (player: Player) => void;
  onSelectPlayerProfile?: (player: Player) => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({
  teams,
  players,
  onSaveTeam,
  onDeleteTeam,
  onSavePlayer,
  onSelectPlayerProfile,
}) => {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isViewTeamModalOpen, setIsViewTeamModalOpen] = useState(false);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);

  // Form State for Create / Edit Team
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [logoColor, setLogoColor] = useState('#10b981');
  const [logoUrl, setLogoUrl] = useState('');
  const [captainId, setCaptainId] = useState('');
  const [viceCaptainId, setViceCaptainId] = useState('');
  const [wicketKeeperId, setWicketKeeperId] = useState('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [playingXIIds, setPlayingXIIds] = useState<string[]>([]);
  const [substituteIds, setSubstituteIds] = useState<string[]>([]);

  // Search & Filters
  const [searchTeamQuery, setSearchTeamQuery] = useState('');
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');

  // Inline Player Creation Modal / Form
  const [isCreatePlayerInlineOpen, setIsCreatePlayerInlineOpen] = useState(false);
  const [isAddExistingPlayerOpen, setIsAddExistingPlayerOpen] = useState(false);
  const [inlinePlayerName, setInlinePlayerName] = useState('');
  const [inlineJersey, setInlineJersey] = useState<string>('');
  const [inlineRole, setInlineRole] = useState<PlayerRole>('Batsman');
  const [inlineBattingStyle, setInlineBattingStyle] = useState<BattingStyle>('Right Hand');
  const [inlineBowlingStyle, setInlineBowlingStyle] = useState<string>('None');
  const [inlinePhotoUrl, setInlinePhotoUrl] = useState('');
  const [inlineWarning, setInlineWarning] = useState<string | null>(null);

  // Inline Player Edit state (for squad view)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Success notice
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openCreateModal = () => {
    setActiveTeam(null);
    setName('');
    setShortName('');
    setLogoColor('#10b981');
    setLogoUrl('');
    setCaptainId('');
    setViceCaptainId('');
    setWicketKeeperId('');
    setSelectedPlayerIds([]);
    setPlayingXIIds([]);
    setSubstituteIds([]);
    setIsModalOpen(true);
  };

  const openEditModal = (team: Team) => {
    setActiveTeam(team);
    setName(team.name);
    setShortName(team.shortName);
    setLogoColor(team.logoColor);
    setLogoUrl(team.logoUrl || '');
    setCaptainId(team.captainId);
    setViceCaptainId(team.viceCaptainId);
    setWicketKeeperId(team.wicketKeeperId);
    setSelectedPlayerIds([...team.playerIds]);
    setPlayingXIIds(team.playingXIIds ? [...team.playingXIIds] : team.playerIds.slice(0, 11));
    setSubstituteIds(team.substituteIds ? [...team.substituteIds] : team.playerIds.slice(11));
    setIsModalOpen(true);
  };

  const openRosterModal = (team: Team) => {
    setActiveTeam(team);
    setIsRosterModalOpen(true);
  };

  const openViewTeamModal = (team: Team) => {
    setViewingTeam(team);
    setIsViewTeamModalOpen(true);
  };

  const handleDuplicateTeam = (team: Team) => {
    const duplicated = StorageService.duplicateTeam(team.id);
    if (duplicated) {
      onSaveTeam(duplicated);
      showToast(`Team duplicated as "${duplicated.name}"!`);
    }
  };

  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      setSelectedPlayerIds(selectedPlayerIds.filter((id) => id !== playerId));
      setPlayingXIIds(playingXIIds.filter((id) => id !== playerId));
      setSubstituteIds(substituteIds.filter((id) => id !== playerId));
      if (captainId === playerId) setCaptainId('');
      if (viceCaptainId === playerId) setViceCaptainId('');
      if (wicketKeeperId === playerId) setWicketKeeperId('');
    } else {
      const next = [...selectedPlayerIds, playerId];
      setSelectedPlayerIds(next);
      if (next.length <= 11) {
        setPlayingXIIds((prev) => [...prev, playerId]);
      } else {
        setSubstituteIds((prev) => [...prev, playerId]);
      }
      if (!captainId) setCaptainId(playerId);
      else if (!viceCaptainId && playerId !== captainId) setViceCaptainId(playerId);
      const playerObj = players.find((p) => p.id === playerId);
      if (playerObj?.role === 'Wicket Keeper' && !wicketKeeperId) {
        setWicketKeeperId(playerId);
      }
    }
  };

  const togglePlayingXIRole = (playerId: string) => {
    if (playingXIIds.includes(playerId)) {
      // Move to substitutes
      setPlayingXIIds(playingXIIds.filter((id) => id !== playerId));
      setSubstituteIds((prev) => [...prev, playerId]);
    } else {
      // Move to Playing XI (max 11)
      if (playingXIIds.length >= 11) {
        alert('Playing XI already has 11 players. Move a player to substitutes first.');
        return;
      }
      setSubstituteIds(substituteIds.filter((id) => id !== playerId));
      setPlayingXIIds((prev) => [...prev, playerId]);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setLogoUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const teamId = activeTeam?.id || `team_${Date.now()}`;
    const autoShort = shortName.trim()
      ? shortName.trim().toUpperCase()
      : name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 4);

    const teamToSave: Team = {
      id: teamId,
      name: name.trim(),
      shortName: autoShort,
      logoColor,
      logoUrl: logoUrl.trim() || undefined,
      captainId: captainId || selectedPlayerIds[0] || '',
      viceCaptainId: viceCaptainId || selectedPlayerIds[1] || '',
      wicketKeeperId: wicketKeeperId || selectedPlayerIds[2] || '',
      playerIds: selectedPlayerIds,
      playingXIIds: playingXIIds.length > 0 ? playingXIIds : selectedPlayerIds.slice(0, 11),
      substituteIds: substituteIds.length > 0 ? substituteIds : selectedPlayerIds.slice(11),
      stats: activeTeam?.stats || {
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
      },
    };

    onSaveTeam(teamToSave);
    setIsModalOpen(false);
    showToast(`Team "${teamToSave.name}" saved successfully!`);
  };

  // Inline Quick Player Creation (Section 3: [ + CREATE NEW PLAYER ])
  const handleSaveInlinePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    setInlineWarning(null);

    if (!inlinePlayerName.trim()) {
      alert('Please enter a player name.');
      return;
    }

    if (inlineJersey === '' || isNaN(Number(inlineJersey))) {
      alert('Please enter a jersey number (0–99).');
      return;
    }

    const jNum = Math.floor(Number(inlineJersey));
    if (jNum < 0 || jNum > 99) {
      alert('Jersey number must be between 0 and 99.');
      return;
    }

    // Check duplicate jersey number on this team
    const currentTeamId = activeTeam?.id;
    if (currentTeamId) {
      const validation = StorageService.validateJerseyNumber(jNum, currentTeamId);
      if (!validation.isValid) {
        setInlineWarning(
          `Jersey number ${jNum} is already assigned to ${validation.conflictingPlayerName}. Please choose another number.`
        );
        return;
      }
    } else {
      const conflictId = selectedPlayerIds.find((id) => {
        const p = players.find((pl) => pl.id === id);
        return p?.jerseyNumber === jNum;
      });
      if (conflictId) {
        const conflict = players.find((p) => p.id === conflictId);
        setInlineWarning(
          `Jersey number ${jNum} is already assigned to ${conflict?.name}. Please choose another number.`
        );
        return;
      }
    }

    const newId = `CC${(players.length + 1).toString().padStart(3, '0')}`;
    const newPlayer: Player = {
      id: newId,
      name: inlinePlayerName.trim(),
      age: 24,
      jerseyNumber: jNum,
      role: inlineRole,
      battingStyle: inlineBattingStyle,
      bowlingStyle: inlineBowlingStyle,
      teamId: activeTeam?.id || undefined,
      teamName: activeTeam?.name || name.trim() || undefined,
      avatarColor: logoColor,
      photoUrl: inlinePhotoUrl.trim() || undefined,
      stats: {
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

    onSavePlayer(newPlayer);
    setSelectedPlayerIds((prev) => [...prev, newId]);

    // If inside squad roster view of an existing team, update team roster immediately
    if (activeTeam && isRosterModalOpen) {
      const updatedTeam = {
        ...activeTeam,
        playerIds: [...activeTeam.playerIds, newId],
        playingXIIds: activeTeam.playingXIIds?.length && activeTeam.playingXIIds.length < 11
          ? [...activeTeam.playingXIIds, newId]
          : activeTeam.playingXIIds || [newId],
        substituteIds: activeTeam.playingXIIds && activeTeam.playingXIIds.length >= 11
          ? [...(activeTeam.substituteIds || []), newId]
          : activeTeam.substituteIds || [],
      };
      onSaveTeam(updatedTeam);
      setActiveTeam(updatedTeam);
    }

    // Reset inline form
    setInlinePlayerName('');
    setInlineJersey('');
    setInlinePhotoUrl('');
    setIsCreatePlayerInlineOpen(false);
    showToast(`Player "${newPlayer.name}" created and added to squad!`);
  };

  // Add existing player to squad
  const handleAddExistingPlayerToSquad = (playerId: string) => {
    if (!activeTeam) return;
    if (activeTeam.playerIds.includes(playerId)) return;

    const updatedIds = [...activeTeam.playerIds, playerId];
    const isXI = (activeTeam.playingXIIds || []).length < 11;
    const updatedTeam: Team = {
      ...activeTeam,
      playerIds: updatedIds,
      playingXIIds: isXI ? [...(activeTeam.playingXIIds || []), playerId] : activeTeam.playingXIIds || [],
      substituteIds: !isXI ? [...(activeTeam.substituteIds || []), playerId] : activeTeam.substituteIds || [],
    };
    onSaveTeam(updatedTeam);
    setActiveTeam(updatedTeam);
    setIsAddExistingPlayerOpen(false);
    showToast(`Player added to squad!`);
  };

  // Remove player from active team squad
  const handleRemovePlayerFromSquad = (playerId: string) => {
    if (!activeTeam) return;
    const updatedIds = activeTeam.playerIds.filter((id) => id !== playerId);
    const updatedXI = (activeTeam.playingXIIds || []).filter((id) => id !== playerId);
    const updatedSubs = (activeTeam.substituteIds || []).filter((id) => id !== playerId);

    const updatedTeam: Team = {
      ...activeTeam,
      playerIds: updatedIds,
      playingXIIds: updatedXI,
      substituteIds: updatedSubs,
      captainId: activeTeam.captainId === playerId ? updatedIds[0] || '' : activeTeam.captainId,
      viceCaptainId: activeTeam.viceCaptainId === playerId ? updatedIds[1] || '' : activeTeam.viceCaptainId,
      wicketKeeperId: activeTeam.wicketKeeperId === playerId ? updatedIds[2] || '' : activeTeam.wicketKeeperId,
    };
    onSaveTeam(updatedTeam);
    setActiveTeam(updatedTeam);
    showToast(`Player removed from squad.`);
  };

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  const filteredTeams = teams.filter((t) => {
    const q = searchTeamQuery.trim().toLowerCase();
    if (!q) return true;
    return t.name.toLowerCase().includes(q) || t.shortName.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and ➕ CREATE NEW TEAM Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-cyber font-bold text-white tracking-wide">
            TEAM MANAGEMENT & SQUADS
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">
            {teams.length} Registered Cricket Teams · Custom Playing XI & Milestone Tracking
          </p>
        </div>

        {/* Section 1: Prominent ➕ CREATE NEW TEAM Button */}
        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-cyber font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
        >
          <span className="text-base font-black">➕</span>
          <span>CREATE NEW TEAM</span>
        </button>
      </div>

      {/* Search Bar for Teams */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="🔍 Search teams by name or short code (e.g. Cyber Warriors, ANU, Thunder)..."
          value={searchTeamQuery}
          onChange={(e) => setSearchTeamQuery(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => {
          const squadPlayers = players.filter((p) => team.playerIds.includes(p.id));
          const captain = players.find((p) => p.id === team.captainId);
          const viceCaptain = players.find((p) => p.id === team.viceCaptainId);
          const keeper = players.find((p) => p.id === team.wicketKeeperId);
          const teamStats = StorageService.getTeamStats(team.id);

          return (
            <div
              key={team.id}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:shadow-2xl transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Team Brand Banner & Top Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shadow-md shrink-0"
                      />
                    ) : (
                      <div
                        style={{ backgroundColor: team.logoColor }}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-950 font-cyber font-black text-xl shadow-lg shrink-0 border border-white/20"
                      >
                        {team.shortName}
                      </div>
                    )}
                    <div>
                      <h2 className="font-cyber font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                        {team.name}
                      </h2>
                      <span className="text-xs font-semibold text-emerald-400">
                        {team.playerIds.length} Squad Players
                      </span>
                    </div>
                  </div>

                  {/* Actions: View, Edit, Duplicate, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openViewTeamModal(team)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="View Team & Statistics"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => openEditModal(team)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit Team"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDuplicateTeam(team)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Duplicate Team"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete team "${team.name}"?`)) {
                          onDeleteTeam(team.id);
                        }
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Team"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Team Quick Statistics Banner (Requirement 18) */}
                <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Matches</span>
                    <span className="font-mono-num font-bold text-white text-sm">
                      {teamStats.matches}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Wins</span>
                    <span className="font-mono-num font-bold text-emerald-400 text-sm">
                      {teamStats.wins}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">High</span>
                    <span className="font-mono-num font-bold text-white text-xs">
                      {teamStats.highestScore}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Best Bowl</span>
                    <span className="font-mono-num font-bold text-teal-400 text-xs">
                      {teamStats.bestBowling}
                    </span>
                  </div>
                </div>

                {/* Leadership Box */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Award size={13} className="text-amber-400" />
                      <span>Captain (C):</span>
                    </span>
                    <span className="font-semibold text-white">
                      {captain ? `${formatJersey(captain.jerseyNumber)} ${captain.name}` : 'Not assigned'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Shield size={13} className="text-teal-400" />
                      <span>Vice Captain (VC):</span>
                    </span>
                    <span className="font-semibold text-white">
                      {viceCaptain ? `${formatJersey(viceCaptain.jerseyNumber)} ${viceCaptain.name}` : 'Not assigned'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Users size={13} className="text-indigo-400" />
                      <span>Wicket Keeper (WK):</span>
                    </span>
                    <span className="font-semibold text-white">
                      {keeper ? `${formatJersey(keeper.jerseyNumber)} ${keeper.name}` : 'Not assigned'}
                    </span>
                  </div>
                </div>

                {/* Squad Lineup Preview */}
                <div className="mt-4">
                  <p className="text-[11px] text-slate-400 uppercase font-semibold mb-2">
                    Squad Lineup ({squadPlayers.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {squadPlayers.slice(0, 8).map((p) => (
                      <span
                        key={p.id}
                        className="px-2 py-1 rounded-lg bg-slate-800/80 text-[11px] text-slate-200 font-medium flex items-center gap-1"
                      >
                        <strong className="text-emerald-400 font-mono-num">
                          {formatJersey(p.jerseyNumber)}
                        </strong>
                        <span>{p.name}</span>
                      </span>
                    ))}
                    {squadPlayers.length > 8 && (
                      <span className="px-2 py-1 rounded-lg bg-slate-800/40 text-[11px] text-slate-500 font-medium">
                        +{squadPlayers.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Primary Actions: VIEW TEAM, EDIT TEAM, DUPLICATE TEAM, DELETE TEAM */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openViewTeamModal(team)}
                    className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-cyber font-bold uppercase tracking-wider text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye size={13} className="text-cyan-400" />
                    <span>VIEW TEAM</span>
                  </button>

                  <button
                    onClick={() => openEditModal(team)}
                    className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-cyber font-bold uppercase tracking-wider text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit2 size={13} className="text-amber-400" />
                    <span>EDIT TEAM</span>
                  </button>

                  <button
                    onClick={() => handleDuplicateTeam(team)}
                    className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-cyber font-bold uppercase tracking-wider text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy size={13} className="text-teal-400" />
                    <span>DUPLICATE</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete team "${team.name}"?`)) {
                        onDeleteTeam(team.id);
                      }
                    }}
                    className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-xs font-cyber font-bold uppercase tracking-wider text-rose-300 hover:text-rose-400 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={13} />
                    <span>DELETE</span>
                  </button>
                </div>

                <button
                  onClick={() => openRosterModal(team)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-xs font-cyber font-bold uppercase tracking-wider text-emerald-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Users size={14} className="text-emerald-400" />
                  <span>MANAGE SQUAD & PLAYING XI ({team.playerIds.length})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. CREATE / EDIT TEAM MODAL (Section 1 Exact Specification)
      ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-cyber font-bold text-xl text-white tracking-wide">
                  {activeTeam ? 'EDIT TEAM' : 'CREATE TEAM'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Customize team identity, leadership & squad</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTeamSubmit} className="p-6 space-y-5">
              {/* Team Name & Short Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cyber Warriors, ANU Strikers, Thunder Kings..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Team Short Name
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="CW"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono-num font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Team Logo (Upload or Color) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-slate-300 uppercase">
                  Team Logo / Badge
                </label>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div
                      style={{ backgroundColor: logoColor }}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-950 font-cyber font-black text-xl shadow-md shrink-0 border border-white/20"
                    >
                      {shortName || 'CC'}
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer flex items-center gap-1.5 font-medium transition-colors">
                        <Upload size={13} />
                        <span>Upload Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                      </label>
                      {logoUrl && (
                        <button
                          type="button"
                          onClick={() => setLogoUrl('')}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-500 uppercase font-semibold">Badge Color:</span>
                      {['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#e11d48'].map(
                        (col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setLogoColor(col)}
                            style={{ backgroundColor: col }}
                            className={`w-6 h-6 rounded-lg transition-transform ${
                              logoColor === col ? 'scale-110 ring-2 ring-white' : 'opacity-70'
                            }`}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Leadership Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase mb-1">
                    Team Captain (C)
                  </label>
                  <select
                    value={captainId}
                    onChange={(e) => setCaptainId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Captain</option>
                    {selectedPlayerIds.map((id) => {
                      const p = players.find((pl) => pl.id === id);
                      return (
                        <option key={id} value={id}>
                          {p ? `${formatJersey(p.jerseyNumber)} ${p.name}` : id}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-teal-400 uppercase mb-1">
                    Vice Captain (VC)
                  </label>
                  <select
                    value={viceCaptainId}
                    onChange={(e) => setViceCaptainId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Vice Captain</option>
                    {selectedPlayerIds.map((id) => {
                      const p = players.find((pl) => pl.id === id);
                      return (
                        <option key={id} value={id}>
                          {p ? `${formatJersey(p.jerseyNumber)} ${p.name}` : id}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-indigo-400 uppercase mb-1">
                    Wicket Keeper (WK)
                  </label>
                  <select
                    value={wicketKeeperId}
                    onChange={(e) => setWicketKeeperId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Wicket Keeper</option>
                    {selectedPlayerIds.map((id) => {
                      const p = players.find((pl) => pl.id === id);
                      return (
                        <option key={id} value={id}>
                          {p ? `${formatJersey(p.jerseyNumber)} ${p.name}` : id}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Player Selector Section (ADD PLAYERS) */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase">
                    Squad Players ({selectedPlayerIds.length} Selected)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreatePlayerInlineOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>Create New Player Inline</span>
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/60 pr-1">
                  {players.map((p) => {
                    const isSelected = selectedPlayerIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => togglePlayerSelection(p.id)}
                        className={`py-2 px-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-500/15 text-white' : 'hover:bg-slate-900 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono-num font-bold text-xs px-2 py-0.5 rounded-md bg-slate-900 text-emerald-400 border border-slate-800">
                            {formatJersey(p.jerseyNumber)}
                          </span>
                          <span className="font-semibold text-xs text-white">{p.name}</span>
                          <span className="text-[10px] text-slate-500">({p.role})</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${
                            isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'border border-slate-700'
                          }`}
                        >
                          {isSelected && <Check size={12} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20"
                >
                  {activeTeam ? 'SAVE CHANGES' : 'CREATE TEAM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. VIEW TEAM MODAL (Full Team Statistics & Playing XI)
      ───────────────────────────────────────────────────────────── */}
      {isViewTeamModalOpen && viewingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 relative">
              <button
                onClick={() => setIsViewTeamModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors absolute top-5 right-5"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-4">
                {viewingTeam.logoUrl ? (
                  <img
                    src={viewingTeam.logoUrl}
                    alt={viewingTeam.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shadow-lg shrink-0"
                  />
                ) : (
                  <div
                    style={{ backgroundColor: viewingTeam.logoColor }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-slate-950 font-cyber font-black text-2xl shadow-xl shrink-0 border border-white/20"
                  >
                    {viewingTeam.shortName}
                  </div>
                )}

                <div>
                  <h2 className="font-cyber font-bold text-2xl text-white">
                    {viewingTeam.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="font-mono-num font-bold text-emerald-400">
                      [{viewingTeam.shortName}]
                    </span>
                    <span>·</span>
                    <span>{viewingTeam.playerIds.length} Total Players</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Section 18: TEAM STATISTICS DISPLAY */}
              {(() => {
                const stats = StorageService.getTeamStats(viewingTeam.id);
                return (
                  <div className="space-y-3">
                    <h3 className="font-cyber font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Trophy size={14} className="text-amber-400" />
                      <span>TEAM STATISTICS</span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono-num">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 font-sans block text-[10px] uppercase">Matches</span>
                        <span className="font-bold text-white text-base">{stats.matches}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 font-sans block text-[10px] uppercase">Wins</span>
                        <span className="font-bold text-emerald-400 text-base">{stats.wins}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 font-sans block text-[10px] uppercase">Losses</span>
                        <span className="font-bold text-rose-400 text-base">{stats.losses}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 font-sans block text-[10px] uppercase">Ties / NR</span>
                        <span className="font-bold text-slate-200 text-base">{stats.ties} / {stats.noResults}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 font-sans block text-[10px] uppercase">Highest Score</span>
                        <span className="font-bold text-emerald-400 text-sm">{stats.highestScore}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 font-sans block text-[10px] uppercase">Best Bowling</span>
                        <span className="font-bold text-teal-400 text-sm">{stats.bestBowling}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 font-sans block text-[10px] uppercase">Total Runs</span>
                        <span className="font-bold text-white text-sm">{stats.totalRuns}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 font-sans block text-[10px] uppercase">Win Rate</span>
                        <span className="font-bold text-emerald-400 text-sm">{stats.winPercentage || 0}%</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Playing XI vs Substitutes */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-cyber font-bold text-xs uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                    <Users size={14} />
                    <span>Playing XI Lineup</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(viewingTeam.playingXIIds?.length
                      ? viewingTeam.playingXIIds
                      : viewingTeam.playerIds.slice(0, 11)
                    ).map((id, idx) => {
                      const p = getPlayer(id);
                      if (!p) return null;
                      const isC = id === viewingTeam.captainId;
                      const isVC = id === viewingTeam.viceCaptainId;
                      const isWK = id === viewingTeam.wicketKeeperId;

                      return (
                        <div
                          key={id}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono-num font-bold text-slate-500 w-4 text-[11px]">
                              {idx + 1}.
                            </span>
                            <span className="font-mono-num font-black text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              {formatJersey(p.jerseyNumber)}
                            </span>
                            <span className="font-semibold text-white">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-bold">
                            {isC && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">C</span>}
                            {isVC && <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300">VC</span>}
                            {isWK && <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">WK</span>}
                            <span className="text-slate-400 font-normal">({p.role})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Substitutes */}
                {viewingTeam.playerIds.length > 11 && (
                  <div>
                    <h4 className="font-cyber font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                      Bench / Substitute Players
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingTeam.playerIds.slice(11).map((id) => {
                        const p = getPlayer(id);
                        if (!p) return null;
                        return (
                          <span
                            key={id}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
                          >
                            <span className="font-mono-num font-bold text-slate-400">
                              {formatJersey(p.jerseyNumber)}
                            </span>
                            <span>{p.name}</span>
                            <span className="text-[10px] text-slate-500">({p.role})</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsViewTeamModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. SQUAD MANAGEMENT MODAL (Section 3 Exact Specification)
      ───────────────────────────────────────────────────────────── */}
      {isRosterModalOpen && activeTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-cyber font-bold tracking-widest text-emerald-400 uppercase">
                  CUSTOMIZABLE TEAM SQUAD
                </span>
                <h2 className="font-cyber font-black text-2xl text-white mt-0.5">
                  {activeTeam.name.toUpperCase()}
                </h2>
                <p className="text-xs text-slate-400">
                  {activeTeam.playerIds.length} Squad Players · Assign Playing XI & Substitutes
                </p>
              </div>
              <button
                onClick={() => setIsRosterModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Action Buttons: [ + ADD PLAYER ] and [ + CREATE NEW PLAYER ] */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-semibold text-slate-300">
                  Manage Squad Roster:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddExistingPlayerOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={13} className="text-emerald-400" />
                    <span>+ ADD EXISTING PLAYER</span>
                  </button>

                  <button
                    onClick={() => setIsCreatePlayerInlineOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Plus size={13} />
                    <span>+ CREATE NEW PLAYER</span>
                  </button>
                </div>
              </div>

              {/* Roster Table / List matching exact user format */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {activeTeam.playerIds.map((id) => {
                  const p = getPlayer(id);
                  if (!p) return null;
                  const isCaptain = id === activeTeam.captainId;
                  const isVice = id === activeTeam.viceCaptainId;
                  const isKeeper = id === activeTeam.wicketKeeperId;
                  const isPlayingXI = activeTeam.playingXIIds?.includes(id);

                  return (
                    <div
                      key={id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono-num font-black text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                          {formatJersey(p.jerseyNumber)}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-cyber font-bold text-sm text-white">
                              {p.name}
                            </span>
                            {isCaptain && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                                Captain
                              </span>
                            )}
                            {isVice && (
                              <span className="px-1.5 py-0.5 rounded bg-teal-500/20 border border-teal-500/40 text-[10px] font-bold text-teal-300">
                                Vice Captain
                              </span>
                            )}
                            {isKeeper && (
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-[10px] font-bold text-indigo-300">
                                Wicket Keeper
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            {p.role} · {p.battingStyle} · {p.bowlingStyle}
                          </span>
                        </div>
                      </div>

                      {/* Controls: Playing XI toggle, Edit Player, Remove Player */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const currentXI = activeTeam.playingXIIds || activeTeam.playerIds.slice(0, 11);
                            const updatedXI = currentXI.includes(id)
                              ? currentXI.filter((pid) => pid !== id)
                              : [...currentXI, id];
                            const updatedTeam = {
                              ...activeTeam,
                              playingXIIds: updatedXI,
                              substituteIds: activeTeam.playerIds.filter((pid) => !updatedXI.includes(pid)),
                            };
                            onSaveTeam(updatedTeam);
                            setActiveTeam(updatedTeam);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            isPlayingXI
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title="Toggle Playing XI status"
                        >
                          {isPlayingXI ? 'Playing XI' : 'Substitute'}
                        </button>

                        <button
                          onClick={() => setEditingPlayer(p)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1"
                          title="Edit Player"
                        >
                          <Edit2 size={12} />
                          <span>EDIT</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Remove ${p.name} from squad?`)) {
                              handleRemovePlayerFromSquad(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Remove Player from squad"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsRosterModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Close Squad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ADD EXISTING PLAYER MODAL
      ───────────────────────────────────────────────────────────── */}
      {isAddExistingPlayerOpen && activeTeam && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-cyber font-bold text-base text-white">ADD EXISTING PLAYER</h3>
                <p className="text-xs text-slate-400">Select player to add to {activeTeam.name}</p>
              </div>
              <button
                onClick={() => setIsAddExistingPlayerOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-800 pr-1">
              {players
                .filter((p) => !activeTeam.playerIds.includes(p.id))
                .map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleAddExistingPlayerToSquad(p.id)}
                    className="py-2.5 px-3 rounded-xl flex items-center justify-between hover:bg-slate-950 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono-num font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                        {formatJersey(p.jerseyNumber)}
                      </span>
                      <span className="font-semibold text-xs text-white">{p.name}</span>
                      <span className="text-[10px] text-slate-400">({p.role})</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 hover:underline">
                      + Add
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          INLINE CREATE NEW PLAYER MODAL (Section 3)
      ───────────────────────────────────────────────────────────── */}
      {isCreatePlayerInlineOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-cyber font-bold text-base text-white">CREATE NEW PLAYER</h3>
                <p className="text-xs text-slate-400">Add directly into squad</p>
              </div>
              <button
                onClick={() => setIsCreatePlayerInlineOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

            {inlineWarning && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{inlineWarning}</span>
              </div>
            )}

            <form onSubmit={handleSaveInlinePlayer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">
                    Player Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Virat Kumar"
                    value={inlinePlayerName}
                    onChange={(e) => setInlinePlayerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-emerald-400 font-semibold uppercase mb-1">
                    Jersey (0–99) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    required
                    placeholder="e.g. 07, 18, 45"
                    value={inlineJersey}
                    onChange={(e) => {
                      setInlineJersey(e.target.value);
                      setInlineWarning(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono-num font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">Role</label>
                <select
                  value={inlineRole}
                  onChange={(e) => setInlineRole(e.target.value as PlayerRole)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-rounder">All-rounder</option>
                  <option value="Wicket Keeper">Wicket Keeper</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">Batting</label>
                  <select
                    value={inlineBattingStyle}
                    onChange={(e) => setInlineBattingStyle(e.target.value as BattingStyle)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="Right Hand">Right Hand</option>
                    <option value="Left Hand">Left Hand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">Bowling</label>
                  <select
                    value={inlineBowlingStyle}
                    onChange={(e) => setInlineBowlingStyle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="None">None</option>
                    <option value="Right-arm Fast">Right-arm Fast</option>
                    <option value="Right-arm Medium">Right-arm Medium</option>
                    <option value="Right-arm Off-Spin">Right-arm Off-Spin</option>
                    <option value="Right-arm Leg-Spin">Right-arm Leg-Spin</option>
                    <option value="Left-arm Fast">Left-arm Fast</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">Photo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={inlinePhotoUrl}
                  onChange={(e) => setInlinePhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePlayerInlineOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-cyber font-bold uppercase tracking-wider"
                >
                  Save Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          INLINE EDIT PLAYER MODAL
      ───────────────────────────────────────────────────────────── */}
      {editingPlayer && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-cyber font-bold text-base text-white">EDIT SQUAD PLAYER</h3>
                <p className="text-xs text-slate-400">{editingPlayer.name}</p>
              </div>
              <button
                onClick={() => setEditingPlayer(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSavePlayer(editingPlayer);
                setEditingPlayer(null);
                showToast(`Player "${editingPlayer.name}" updated!`);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">
                  Player Name
                </label>
                <input
                  type="text"
                  required
                  value={editingPlayer.name}
                  onChange={(e) =>
                    setEditingPlayer({ ...editingPlayer, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-emerald-400 font-semibold uppercase mb-1">
                  Jersey Number (0–99)
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  required
                  value={editingPlayer.jerseyNumber}
                  onChange={(e) =>
                    setEditingPlayer({
                      ...editingPlayer,
                      jerseyNumber: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono-num font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">Role</label>
                <select
                  value={editingPlayer.role}
                  onChange={(e) =>
                    setEditingPlayer({
                      ...editingPlayer,
                      role: e.target.value as PlayerRole,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-rounder">All-rounder</option>
                  <option value="Wicket Keeper">Wicket Keeper</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlayer(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-cyber font-bold uppercase tracking-wider"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
