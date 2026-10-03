import React from 'react';
import { Volume2, VolumeX, Shield, Play, PlusCircle, Users, Trophy, BarChart3, Settings } from 'lucide-react';
import { soundEffects } from '../utils/audio';

export type NavView = 'home' | 'live' | 'players' | 'teams' | 'matches' | 'stats' | 'scorecard';

interface NavbarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  hasActiveMatch: boolean;
  activeMatchSummary?: string;
  onOpenCreateMatch: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  hasActiveMatch,
  activeMatchSummary,
  onOpenCreateMatch,
  onOpenSettings,
}) => {
  const [soundOn, setSoundOn] = React.useState(soundEffects.enabled);

  const toggleSound = () => {
    soundEffects.enabled = !soundEffects.enabled;
    setSoundOn(soundEffects.enabled);
    if (soundEffects.enabled) {
      soundEffects.playBeep();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-cyber font-bold text-slate-950 text-xl tracking-wider shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              CC
            </div>
            <div>
              <span className="font-cyber font-bold text-lg sm:text-xl tracking-wide text-white group-hover:text-emerald-400 transition-colors">
                CYBER CRICKET
              </span>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium -mt-1 hidden sm:block">
                Your Cricket · Your Score
              </p>
            </div>
          </button>
        </div>

        {/* Navigation Zone */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              currentView === 'home'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Home
          </button>

          {hasActiveMatch && (
            <button
              onClick={() => onNavigate('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                currentView === 'live'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Match
            </button>
          )}

          <button
            onClick={() => onNavigate('players')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              currentView === 'players'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Players
          </button>

          <button
            onClick={() => onNavigate('teams')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              currentView === 'teams'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Teams
          </button>

          <button
            onClick={() => onNavigate('matches')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              currentView === 'matches'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            History
          </button>

          <button
            onClick={() => onNavigate('stats')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              currentView === 'stats'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Stats
          </button>
        </nav>

        {/* Action Zone */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle Sound Effects"
            className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title={soundOn ? 'Sound On' : 'Sound Muted'}
          >
            {soundOn ? <Volume2 size={16} className="text-emerald-400" /> : <VolumeX size={16} />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Settings & Data"
          >
            <Settings size={16} />
          </button>

          {/* New Match Button */}
          <button
            onClick={onOpenCreateMatch}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <PlusCircle size={15} />
            <span className="hidden sm:inline">New Match</span>
          </button>
        </div>
      </div>

      {/* Mobile Active Match Ticker */}
      {hasActiveMatch && activeMatchSummary && (
        <div
          onClick={() => onNavigate('live')}
          className="md:hidden bg-emerald-950/80 border-t border-emerald-800/60 px-4 py-1.5 flex items-center justify-between text-xs text-emerald-300 cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-semibold truncate">{activeMatchSummary}</span>
          </div>
          <span className="font-bold underline text-emerald-200 shrink-0 ml-2">Score &rarr;</span>
        </div>
      )}
    </header>
  );
};
