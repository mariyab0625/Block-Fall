import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useSound } from '../../hooks/useSound';
import { LEVEL_CONFIG } from '../../utils/levelConfig';
import GameGrid from './GameGrid';
import AnimatedEmoji from '../Shared/AnimatedEmoji';
import Logo from '../Shared/Logo';
import StatDisplay from '../Shared/StatDisplay';
import ProgressBar from '../Shared/ProgressBar';

const CORNERS = [
  { x: '0%',   y: '0%'   },
  { x: '100%', y: '0%'   },
  { x: '0%',   y: '100%' },
  { x: '100%', y: '100%' },
];

export default function GamePage() {
  const navigate = useNavigate();
  const { selectedLevel } = useGame();
  const { state, ghostY, actions } = useGameEngine(selectedLevel);
  const { play } = useSound();
  const isActive = state.phase === 'PLAYING' || state.phase === 'PAUSED';

  useKeyboard({
    moveLeft:  useCallback(() => { actions.moveLeft();  play('move');   }, [actions, play]),
    moveRight: useCallback(() => { actions.moveRight(); play('move');   }, [actions, play]),
    rotate:    useCallback(() => { actions.rotate();    play('rotate'); }, [actions, play]),
    hardDrop:  useCallback(() => { actions.hardDrop();  play('drop');   }, [actions, play]),
    pause:     actions.pause,
    restart:   useCallback(() => actions.restart(selectedLevel), [actions, selectedLevel]),
  }, isActive);

  useEffect(() => {
    if (state.phase === 'ANIMATING') play('clear');
    if (state.phase === 'LEVEL_WIN') play('levelup');
    if (state.phase === 'GAME_OVER') play('gameover');
  }, [state.phase]); // eslint-disable-line

  const cfg      = LEVEL_CONFIG[state.level];
  const isPaused = state.phase === 'PAUSED';

  return (
    <div style={S.page}>
      {/* ── Top bar ── */}
      <header style={S.topBar}>
        <div style={S.logoArea} onClick={() => navigate('/')}>
          <AnimatedEmoji size={32} followCursor={false} bob={false} expression="normal" style={{ flexShrink: 0 }} />
          <Logo size="md" />
        </div>

        <div style={S.levelBadge}>
          <span style={S.levelLabel}>LEVEL</span>
          <span style={S.levelNum}>{state.level}</span>
          <span style={S.levelDiff}>{cfg.label}</span>
        </div>

        <button style={S.pauseBtn} onClick={actions.pause}>
          {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>
      </header>

      {/* ── Play area ── */}
      <div style={S.playArea}>
        <div style={S.sidePanel}>
          <NextPreview piece={state.nextPiece} />
          <ControlsCard />
        </div>

        <div style={S.gridWrapper}>
          <GameGrid state={state} ghostY={ghostY} />

          <AnimatePresence>
            {isPaused && (
              <motion.div key="pause"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={S.pauseOverlay}
              >
                <p style={S.pauseText}>PAUSED</p>
                <p style={S.pauseSub}>Press P or tap Resume</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Corner +10 animations on row clear */}
          <AnimatePresence>
            {(state.scoreEvents ?? [])
              .filter(ev => ev.type === 'row')
              .flatMap(ev =>
                CORNERS.map((corner, ci) => (
                  <FloatingScore
                    key={`${ev.id}-${ci}`}
                    pts={`+${ev.pts}`}
                    corner={corner}
                    delay={ci * 0.05}
                    onDone={() => ci === 0 && actions.dismissEvent(ev.id)}
                  />
                ))
              )}
          </AnimatePresence>
        </div>

        <div style={S.sidePanel}>
          <ScoreCard state={state} cfg={cfg} />
        </div>
      </div>

      {/* ── Level win overlay ── */}
      <AnimatePresence>
        {state.phase === 'LEVEL_WIN' && (
          <WinOverlay
            level={state.level}
            score={state.score}
            rowsCleared={state.rowsThisLevel ?? 0}
            linesToWin={cfg.linesToWin}
            isLast={state.level >= 10}
            onNext={actions.nextLevel}
            onHome={() => navigate('/')}
          />
        )}
      </AnimatePresence>

      {/* ── Game over overlay ── */}
      <AnimatePresence>
        {state.phase === 'GAME_OVER' && (
          <GameOverOverlay
            score={state.score}
            level={state.level}
            rowsCleared={state.rowsCleared}
            reason={state.gameOverReason}
            onRestart={() => actions.restart(selectedLevel)}
            onHome={() => navigate('/')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Floating +10 score animation ── */
function FloatingScore({ pts, corner, delay, onDone }) {
  const startX = corner.x === '0%' ? -10 : 10;
  const startY = corner.y === '0%' ? -10 : 10;
  return (
    <motion.div
      initial={{ x: startX, y: startY, opacity: 1, scale: 0.6 }}
      animate={{ x: 0,      y: 0,      opacity: 0, scale: 1.8 }}
      transition={{ duration: 0.8, ease: 'easeIn', delay }}
      onAnimationComplete={onDone}
      style={{
        position: 'absolute',
        left:   corner.x === '0%' ? 4  : undefined,
        right:  corner.x === '0%' ? undefined : 4,
        top:    corner.y === '0%' ? 4  : undefined,
        bottom: corner.y === '0%' ? undefined : 4,
        pointerEvents: 'none',
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '0.9rem',
        color: '#39ff14',
        textShadow: '0 0 12px #39ff14, 0 0 28px #39ff14',
        whiteSpace: 'nowrap',
        zIndex: 20,
      }}
    >
      {pts}
    </motion.div>
  );
}

/* ── Next piece preview ── */
function NextPreview({ piece }) {
  const CELL = 20;
  return (
    <div style={S.card}>
      <p style={S.cardLabel}>NEXT PIECE</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 60 }}>
        {piece && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${piece.shape[0].length}, ${CELL}px)`,
            gridTemplateRows:    `repeat(${piece.shape.length}, ${CELL}px)`,
          }}>
            {piece.shape.flat().map((c, i) => (
              <div key={i} style={{
                width: CELL, height: CELL,
                background: c ? piece.color : 'transparent',
                boxShadow: c ? `0 0 6px ${piece.color}` : 'none',
                border: c ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                borderRadius: 2,
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Controls reference card ── */
function ControlsCard() {
  const controls = [
    ['← →',   'Move'],
    ['Space', 'Rotate (×4)'],
    ['↓',     'Hard Drop'],
    ['P',     'Pause'],
    ['R',     'Restart'],
  ];
  return (
    <div style={S.card}>
      <p style={S.cardLabel}>CONTROLS</p>
      {controls.map(([k, a]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
          <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#f5e642', textShadow: '0 0 6px #f5e642' }}>{k}</span>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem',  color: 'rgba(255,255,255,0.45)' }}>{a}</span>
        </div>
      ))}
      <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: 8, lineHeight: 1.5 }}>
        Space ×1 = vertical<br />
        Space ×2 = upside down<br />
        Space ×3 = right-facing<br />
        Space ×4 = original
      </p>
    </div>
  );
}

/* ── Score card (right side panel) ── */
function ScoreCard({ state, cfg }) {
  const rowsThisLevel = state.rowsThisLevel ?? 0;
  const linesToWin    = cfg.linesToWin;
  const pct = linesToWin ? Math.min((rowsThisLevel / linesToWin) * 100, 100) : 100;

  return (
    <div style={S.card}>
      <StatDisplay label="SCORE" value={state.score.toLocaleString()} color="#00f5ff" divider animate />
      <StatDisplay label="LEVEL" value={state.level}                  color="#f5e642" divider animate />
      <StatDisplay label="ROWS"  value={state.rowsCleared}            color="#39ff14" divider animate />

      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={S.cardLabel}>LEVEL GOAL</p>
        {linesToWin ? (
          <>
            <ProgressBar pct={pct} color="#39ff14" style={{ margin: '6px 0 4px' }} />
            <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
              {rowsThisLevel} / {linesToWin} rows
            </p>
            <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.68rem', color: 'rgba(255,80,80,0.7)', marginTop: 3 }}>
              ⚠ Column full = Game Over
            </p>
          </>
        ) : (
          <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: '#ff00aa', textShadow: '0 0 8px #ff00aa' }}>⚡ FINAL LEVEL</p>
        )}
      </div>

      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={S.cardLabel}>SCORING</p>
        <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>
          +1 per block placed<br />+10 per row cleared
        </p>
      </div>
    </div>
  );
}

/* ── Overlay shared button ── */
function OverlayBtn({ label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '12px 0',
        border: `2px solid ${color}`, borderRadius: 6,
        background: 'transparent', color,
        fontFamily: 'Orbitron, sans-serif', fontSize: '0.75rem',
        letterSpacing: '0.12em', cursor: 'pointer',
        textShadow: `0 0 8px ${color}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 20px ${color}50`; e.currentTarget.style.transform = 'scale(1.03)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseDown={e  => { e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e    => { e.currentTarget.style.transform = 'scale(1.03)'; }}
    >
      {label}
    </button>
  );
}

/* ── Shared stats row inside overlays ── */
function OverlayStats({ score, level, rowsCleared }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 28, width: '100%' }}>
      <StatDisplay label="SCORE" value={score.toLocaleString()} color="#00f5ff" animate={false} valueSize="1.2rem" />
      <StatDisplay label="LEVEL" value={level}                  color="#f5e642" animate={false} valueSize="1.2rem" />
      <StatDisplay label="ROWS"  value={rowsCleared}            color="#39ff14" animate={false} valueSize="1.2rem" />
    </div>
  );
}

/* ── Win overlay ── */
function WinOverlay({ level, score, rowsCleared, linesToWin, isLast, onNext, onHome }) {
  return (
    <motion.div key="win" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={S.overlay}>
      <motion.div
        initial={{ scale: 0.75, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.75, y: 50 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        style={{ ...S.overlayBox, borderColor: '#39ff14', boxShadow: '0 0 60px rgba(57,255,20,0.45)' }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{ fontSize: '4rem', marginBottom: 12 }}
        >
          🏆
        </motion.div>

        <h1 style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '1rem', color: '#39ff14', textShadow: '0 0 20px #39ff14', marginBottom: 6 }}>
          LEVEL {level} CLEARED!
        </h1>
        <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
          Cleared {rowsCleared} / {linesToWin} rows
        </p>

        <OverlayStats score={score} level={level} rowsCleared={rowsCleared} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          {!isLast
            ? <OverlayBtn label="▶ NEXT LEVEL"  color="#00f5ff" onClick={onNext} />
            : <p style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '0.65rem', color: '#ff00aa', textAlign: 'center', marginBottom: 8 }}>🎉 YOU BEAT ALL 10 LEVELS!</p>
          }
          <OverlayBtn label="← MAIN MENU" color="#ff00aa" onClick={onHome} />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Game over overlay ── */
function GameOverOverlay({ score, level, rowsCleared, reason, onRestart, onHome }) {
  const msg = reason === 'column_full'
    ? 'A column was completely filled!'
    : 'No space left to place a block!';

  return (
    <motion.div key="over" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={S.overlay}>
      <motion.div
        initial={{ scale: 0.75, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.75, y: 50 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        style={{ ...S.overlayBox, borderColor: '#ff00aa', boxShadow: '0 0 60px rgba(255,0,170,0.45)' }}
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, -8, 8, 0] }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ fontSize: '4rem', marginBottom: 12 }}
        >
          💀
        </motion.div>

        <motion.h1
          animate={{ textShadow: ['0 0 10px #ff00aa', '0 0 40px #ff00aa', '0 0 10px #ff00aa'] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '1.3rem', color: '#ff00aa', marginBottom: 10 }}
        >
          GAME OVER
        </motion.h1>
        <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.9rem', color: 'rgba(255,120,120,0.9)', marginBottom: 20 }}>
          {msg}
        </p>

        <OverlayStats score={score} level={level} rowsCleared={rowsCleared} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <OverlayBtn label="↺ PLAY AGAIN" color="#00f5ff" onClick={onRestart} />
          <OverlayBtn label="← MAIN MENU"  color="#ff00aa" onClick={onHome}    />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Styles object ── */
const S = {
  page:         { width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0f', overflow: 'hidden' },
  topBar:       { height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(10,10,15,0.95)', borderBottom: '1px solid rgba(0,245,255,0.12)' },
  logoArea:     { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' },
  levelBadge:   { display: 'flex', alignItems: 'center', gap: 10 },
  levelLabel:   { fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' },
  levelNum:     { fontFamily: 'Orbitron, sans-serif', fontSize: '1.1rem', color: '#f5e642', textShadow: '0 0 10px #f5e642' },
  levelDiff:    { fontFamily: 'Rajdhani, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' },
  pauseBtn:     { fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', letterSpacing: '0.1em', padding: '7px 16px', border: '2px solid #f5e642', borderRadius: 4, background: 'transparent', color: '#f5e642', cursor: 'pointer', textShadow: '0 0 8px #f5e642' },
  playArea:     { flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '12px 20px', overflow: 'hidden' },
  sidePanel:    { width: 160, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, alignSelf: 'center' },
  gridWrapper:  { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card:         { background: '#111122', border: '1px solid rgba(0,245,255,0.15)', borderRadius: 8, padding: '12px 14px' },
  cardLabel:    { fontFamily: 'Orbitron, sans-serif', fontSize: '0.48rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', marginBottom: 4 },
  pauseOverlay: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)', borderRadius: 4, zIndex: 10 },
  pauseText:    { fontFamily: 'Press Start 2P, monospace', fontSize: '1.4rem', color: '#00f5ff', textShadow: '0 0 20px #00f5ff' },
  pauseSub:     { fontFamily: 'Rajdhani, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', marginTop: 8 },
  overlay:      { position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' },
  overlayBox:   { background: '#0d0d1a', border: '2px solid', borderRadius: 14, padding: '40px 36px', width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
};
