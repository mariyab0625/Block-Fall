import { useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';

// Dummy audio — generates a short beep via Web Audio API as placeholder
function createBeep(ctx, freq = 440, duration = 0.1, vol = 0.3) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = 'square';
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

const SOUND_MAP = {
  drop:    { freq: 180, duration: 0.08 },
  rotate:  { freq: 440, duration: 0.06 },
  clear:   { freq: 660, duration: 0.25 },
  levelup: { freq: 880, duration: 0.4  },
  gameover:{ freq: 120, duration: 0.6  },
  move:    { freq: 300, duration: 0.04 },
};

export function useSound() {
  const { soundEnabled, volume } = useGame();
  const audioCtxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const play = useCallback((name) => {
    if (!soundEnabled) return;
    const cfg = SOUND_MAP[name];
    if (!cfg) return;
    try {
      const ctx = getCtx();
      createBeep(ctx, cfg.freq, cfg.duration, volume * 0.5);
    } catch (_) {}
  }, [soundEnabled, volume, getCtx]);

  return { play };
}
