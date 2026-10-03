import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Award, Flame, Trophy, Zap, Sparkles } from 'lucide-react';
import { MatchMilestoneItem } from '../types/cricket';
import { formatJersey } from '../utils/cricketMath';
import { soundEffects } from '../utils/audio';

interface MilestoneCelebrationProps {
  milestone: MatchMilestoneItem | null;
  onDismiss: () => void;
  jerseyNumber?: number;
  animationsEnabled?: boolean;
  soundEnabled?: boolean;
}

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  milestone,
  onDismiss,
  jerseyNumber,
  animationsEnabled = true,
  soundEnabled = true,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!milestone) return;

    // Trigger appropriate sound synthesis
    if (soundEnabled && soundEffects.enabled) {
      if (milestone.type === '30') {
        soundEffects.playMilestone30();
      } else if (milestone.type === '50') {
        soundEffects.playMilestone50();
      } else if (milestone.type === '100' || milestone.type === '150' || milestone.type === '200') {
        soundEffects.playMilestone100();
      } else if (milestone.type.endsWith('w')) {
        const count = parseInt(milestone.type.replace('w', ''), 10) || 5;
        soundEffects.playMilestoneWickets(count);
      }
    }

    // Trigger confetti for centuries, double centuries, or 5-wicket hauls
    if (animationsEnabled) {
      if (milestone.type === '100' || milestone.type === '150' || milestone.type === '200' || milestone.type === '5w' || milestone.type === '10w') {
        try {
          confetti({
            particleCount: milestone.type === '100' || milestone.type === '200' ? 100 : 70,
            spread: 70,
            origin: { y: 0.25 },
            colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
          });
        } catch {
          // confetti fallback
        }
      }
    }

    // Progress timer: 4.5 seconds auto dismiss
    setProgress(100);
    const startTime = Date.now();
    const duration = 4500;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remainingPct);
      if (elapsed >= duration) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [milestone]);

  if (!milestone) return null;

  const isBatting = ['30', '50', '100', '150', '200'].includes(milestone.type);
  const isCentury = milestone.type === '100' || milestone.type === '150' || milestone.type === '200';
  const isFifty = milestone.type === '50';
  const isThirty = milestone.type === '30';
  const isFiveWickets = milestone.type === '5w' || milestone.type === '10w';

  // Dynamic border & glow accents
  let badgeBorder = 'border-emerald-500/50';
  let badgeGlow = 'shadow-emerald-500/20';
  let badgeHeaderBg = 'from-emerald-950/80 to-slate-900';

  if (isCentury) {
    badgeBorder = 'border-amber-400/80 ring-2 ring-amber-400/30';
    badgeGlow = 'shadow-amber-500/30';
    badgeHeaderBg = 'from-amber-950/80 via-slate-900 to-amber-950/60';
  } else if (isFifty) {
    badgeBorder = 'border-teal-500/60 ring-1 ring-teal-400/20';
    badgeGlow = 'shadow-teal-500/20';
    badgeHeaderBg = 'from-teal-950/80 to-slate-900';
  } else if (isFiveWickets) {
    badgeBorder = 'border-rose-500/70 ring-2 ring-rose-400/30';
    badgeGlow = 'shadow-rose-500/30';
    badgeHeaderBg = 'from-rose-950/80 via-slate-900 to-rose-950/60';
  }

  const effectiveJersey = milestone.jerseyNumber !== undefined ? milestone.jerseyNumber : jerseyNumber;

  return (
    <div
      className={`w-full rounded-3xl bg-slate-900 border-2 ${badgeBorder} shadow-2xl ${badgeGlow} overflow-hidden mb-6 relative transition-all duration-300 ${
        animationsEnabled ? 'animate-in fade-in slide-in-from-top-4 duration-300' : ''
      }`}
    >
      {/* Top dismiss bar & Progress bar */}
      <div className="w-full bg-slate-950/60 h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ${
            isCentury ? 'bg-amber-400' : isFiveWickets ? 'bg-rose-500' : 'bg-emerald-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={`p-5 sm:p-6 bg-gradient-to-r ${badgeHeaderBg} relative`}>
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          title="Dismiss celebration"
        >
          <X size={15} />
        </button>

        <div className="flex flex-col items-center text-center space-y-2">
          {/* Header Banner */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono text-xs hidden sm:inline">━━━━━━━━━━</span>
            <span className="font-cyber font-extrabold text-xs sm:text-sm tracking-widest uppercase text-amber-300 flex items-center gap-1.5">
              {milestone.type === '30' && <span>🎉 MILESTONE!</span>}
              {milestone.type === '50' && <span>⭐ HALF CENTURY!</span>}
              {milestone.type === '100' && <span>👑 CENTURY!</span>}
              {milestone.type === '150' && <span>⚡ 150 RUNS!</span>}
              {milestone.type === '200' && <span>🌟 DOUBLE CENTURY!</span>}
              {milestone.type === '3w' && <span>🎯 3-WICKET HAUL!</span>}
              {milestone.type === '4w' && <span>🔥 4 WICKETS!</span>}
              {milestone.type === '5w' && <span>🖐️ 5-WICKET HAUL!</span>}
              {milestone.type === '10w' && <span>🏆 10 WICKETS IN A MATCH!</span>}
            </span>
            <span className="text-slate-500 font-mono text-xs hidden sm:inline">━━━━━━━━━━</span>
          </div>

          {/* Large Title */}
          <h2
            className={`font-cyber font-black text-2xl sm:text-4xl tracking-wide uppercase ${
              isCentury
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400'
                : isFiveWickets
                ? 'text-rose-400'
                : 'text-white'
            }`}
          >
            {milestone.type === '30' && '🏏 30 RUNS!'}
            {milestone.type === '50' && '🏏 50 RUNS!'}
            {milestone.type === '100' && '💯 100 RUNS!'}
            {milestone.type === '150' && '⚡ 150 RUNS!'}
            {milestone.type === '200' && '🌟 DOUBLE CENTURY!'}
            {milestone.type === '3w' && '🎯 3-WICKET HAUL!'}
            {milestone.type === '4w' && '🔥 4 WICKETS!'}
            {milestone.type === '5w' && '🖐️ 5-WICKET HAUL!'}
            {milestone.type === '10w' && '🏆 10 WICKETS IN A MATCH!'}
          </h2>

          {/* Player Identity (Jersey + Name) */}
          <div className="flex items-center gap-2.5 pt-1">
            <span className="font-mono-num font-black text-xs sm:text-sm px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm">
              {formatJersey(effectiveJersey)}
            </span>
            <span className="font-cyber font-bold text-lg sm:text-2xl text-white">
              {milestone.playerName}
            </span>
          </div>

          {/* Tagline / Shoutout */}
          <p className="text-xs sm:text-sm font-cyber font-bold tracking-wider text-amber-300/90 uppercase pt-0.5">
            {milestone.type === '30' && '“MILESTONE!”'}
            {milestone.type === '50' && '“Bat Raised!”'}
            {milestone.type === '100' && '🌟 MASTERCLASS INNINGS! 🔥'}
            {milestone.type === '150' && '🌟 MAGNIFICENT 150! 🚀'}
            {milestone.type === '200' && '🏆 HISTORIC 200! 👑👑👑'}
            {milestone.type === '3w' && '🔥 FIERY SPELL!'}
            {milestone.type === '4w' && 'OUTSTANDING BOWLING!'}
            {milestone.type === '5w' && 'Sensational spell!'}
            {milestone.type === '10w' && 'LEGENDARY!'}
          </p>

          {/* Milestone Details Box */}
          <div className="pt-3 w-full max-w-md">
            {isBatting ? (
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Runs</span>
                  <span className="font-mono-num font-bold text-base text-emerald-400">
                    {milestone.runs}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Balls</span>
                  <span className="font-mono-num font-bold text-base text-white">
                    {milestone.balls}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">4s / 6s</span>
                  <span className="font-mono-num font-bold text-base text-slate-200">
                    {milestone.fours} / {milestone.sixes}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Strike Rate</span>
                  <span className="font-mono-num font-bold text-base text-teal-400">
                    {milestone.strikeRate?.toFixed(1) || '0.0'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Wickets</span>
                  <span className="font-mono-num font-bold text-base text-rose-400">
                    {milestone.wickets}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Overs</span>
                  <span className="font-mono-num font-bold text-base text-white">
                    {milestone.overs || '0.0'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Runs</span>
                  <span className="font-mono-num font-bold text-base text-slate-200">
                    {milestone.runsConceded}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Economy</span>
                  <span className="font-mono-num font-bold text-base text-cyan-400">
                    {milestone.economy?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Applause / Emoji Footer */}
          <div className="pt-2 text-base tracking-widest">
            {milestone.type === '30' && <span className="text-xl">👏👏👏</span>}
            {milestone.type === '50' && <span>🏆 Bat Raised! 👏👏👏</span>}
            {milestone.type === '100' && <span>🎉 🏏 💯 🎉</span>}
            {milestone.type === '150' && <span>👏👏👏 🔥 🏏</span>}
            {milestone.type === '200' && <span>🎉 👑 💯 💯 👑 🎉</span>}
            {milestone.type === '3w' && <span>🎯 👏👏👏</span>}
            {milestone.type === '4w' && <span>🔥 👏👏👏</span>}
            {milestone.type === '5w' && <span>🖐️ 👏👏👏 🔥</span>}
            {milestone.type === '10w' && <span>👑 🏆 👑</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
