import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetToSampleData: () => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetToSampleData,
  onExportData,
  onImportData,
}) => {
  const [soundOn, setSoundOn] = useState(soundEffects.enabled);
  const [celebrationAnimations, setCelebrationAnimations] = useState(
    soundEffects.celebrationAnimationsEnabled ?? true
  );
  const [celebrationSounds, setCelebrationSounds] = useState(
    soundEffects.milestoneSoundEnabled ?? true
  );
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);
  const [importNotice, setImportNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(
    null
  );

  if (!isOpen) return null;

  const toggleSound = () => {
    soundEffects.enabled = !soundEffects.enabled;
    setSoundOn(soundEffects.enabled);
    if (soundEffects.enabled) {
      soundEffects.playBeep();
    }
  };

  const toggleCelebrationAnimations = () => {
    const next = !celebrationAnimations;
    setCelebrationAnimations(next);
    soundEffects.celebrationAnimationsEnabled = next;
  };

  const toggleCelebrationSounds = () => {
    const next = !celebrationSounds;
    setCelebrationSounds(next);
    soundEffects.milestoneSoundEnabled = next;
    if (next && soundEffects.enabled) {
      soundEffects.playMilestone30();
    }
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;

    const success = onImportData(importJsonText.trim());
    if (success) {
      setImportNotice({ type: 'success', msg: 'Data imported successfully!' });
      setTimeout(() => {
        setImportNotice(null);
        setShowImportArea(false);
      }, 1500);
    } else {
      setImportNotice({ type: 'error', msg: 'Invalid JSON data format.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 font-cyber font-bold text-lg">
              CC
            </div>
            <div>
              <h2 className="font-cyber font-bold text-lg text-white">SETTINGS & DATA</h2>
              <p className="text-xs text-slate-400">Cyber Cricket Application Preferences</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sound Effects */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <h3 className="font-cyber font-bold text-sm text-white flex items-center gap-2">
                {soundOn ? <Volume2 size={16} className="text-emerald-400" /> : <VolumeX size={16} />}
                <span>Cricket Sound Effects</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Play acoustic bat taps, boundary 4s, sixes, and wicket sounds
              </p>
            </div>

            <button
              onClick={toggleSound}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                soundOn
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {soundOn ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* Automatic Player Milestone Celebrations Settings (Requirement 10) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div>
              <h3 className="font-cyber font-bold text-sm text-amber-300 flex items-center gap-2">
                <Sparkles size={16} />
                <span>Player Milestone Celebrations</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatic celebrations for 30s, 50s, 100s, 150s, 200s, and 3w, 4w, 5w, 10w hauls
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-300 font-semibold">Celebration Animations</span>
                <button
                  onClick={toggleCelebrationAnimations}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                    celebrationAnimations
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {celebrationAnimations ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-300 font-semibold">Celebration Sounds</span>
                <button
                  onClick={toggleCelebrationSounds}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                    celebrationSounds
                      ? 'bg-emerald-400 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {celebrationSounds ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Sample Data & Reset */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div>
              <h3 className="font-cyber font-bold text-sm text-white flex items-center gap-2">
                <RefreshCw size={16} className="text-cyan-400" />
                <span>Reset to Sample Data</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Preloads official teams (Cyber Warriors, Cyber Kings) and completed sample T20 match
                (187/6 vs 175/8).
              </p>
            </div>

            <button
              onClick={() => {
                if (confirm('Reset all data to default sample teams, players, and match?')) {
                  onResetToSampleData();
                  alert('Reset successfully!');
                }
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-cyber font-bold uppercase tracking-wider text-cyan-300 transition-colors"
            >
              Load Sample Database
            </button>
          </div>

          {/* Backup & Restore */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="font-cyber font-bold text-sm text-white">Backup & Restore</h3>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={onExportData}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Download size={14} className="text-emerald-400" />
                <span>Export JSON Backup</span>
              </button>

              <button
                onClick={() => setShowImportArea(!showImportArea)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Upload size={14} className="text-teal-400" />
                <span>Import JSON</span>
              </button>
            </div>

            {showImportArea && (
              <form onSubmit={handleImportSubmit} className="pt-3 space-y-2">
                <textarea
                  rows={4}
                  placeholder="Paste exported JSON content here..."
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono-num text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />

                {importNotice && (
                  <p
                    className={`text-xs ${
                      importNotice.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {importNotice.msg}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs uppercase"
                  >
                    Load Data
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* App Branding & Tagline */}
          <div className="text-center pt-2 text-xs text-slate-500 space-y-1">
            <p className="font-cyber font-bold text-slate-400">CC – CYBER CRICKET</p>
            <p>“Your Cricket. Your Score. Your Game.”</p>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
