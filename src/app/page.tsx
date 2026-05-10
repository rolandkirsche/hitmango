'use client';

import { useState, useCallback, useEffect } from 'react';
import { levels } from '@/lib/levels';
import { initState, movePlayer, throwCan } from '@/lib/gameEngine';
import { GameState, NodeId } from '@/lib/types';
import GameBoard from '@/components/GameBoard';
import LevelSelect from '@/components/LevelSelect';

const pillBtn = (color: string, border: string, glow?: string): React.CSSProperties => ({
  fontFamily: 'var(--font-ui)',
  fontSize: '13px',
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  padding: '0.55rem 1.5rem',
  borderRadius: 'var(--radius-pill)',
  cursor: 'pointer',
  background: 'none',
  color,
  border: `1px solid ${border}`,
  transition: 'box-shadow 0.15s',
  boxShadow: glow ? `0 0 0 0 ${glow}` : undefined,
});

export default function Home() {
  const [screen, setScreen] = useState<'select' | 'game'>('select');
  const [levelIndex, setLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>(() => initState(levels[0]));
  const [completed, setCompleted] = useState<number[]>([]);
  const [throwMode, setThrowMode] = useState(false);

  const startLevel = useCallback((idx: number) => {
    setLevelIndex(idx);
    setGameState(initState(levels[idx]));
    setThrowMode(false);
    setScreen('game');
  }, []);

  useEffect(() => {
    if (gameState.status === 'won') {
      setCompleted(c => c.includes(levelIndex) ? c : [...c, levelIndex]);
    }
  }, [gameState.status, levelIndex]);

  const handleNodeClick = useCallback((nodeId: NodeId) => {
    if (throwMode) {
      setGameState(prev => throwCan(prev, nodeId));
      setThrowMode(false);
    } else {
      setGameState(prev => movePlayer(prev, nodeId, levels[levelIndex]));
    }
  }, [throwMode, levelIndex]);

  const restart = useCallback(() => {
    setGameState(initState(levels[levelIndex]));
    setThrowMode(false);
  }, [levelIndex]);

  const nextLevel = useCallback(() => {
    const next = levelIndex + 1;
    if (next < levels.length) startLevel(next);
    else setScreen('select');
  }, [levelIndex, startLevel]);

  if (screen === 'select') {
    return <LevelSelect onSelect={startLevel} completed={completed} />;
  }

  const level = levels[levelIndex];
  const { status, moves, cansLeft } = gameState;

  return (
    <div className="game-root">
      {/* Header */}
      <div className="game-header">
        <button
          onClick={() => { setScreen('select'); setThrowMode(false); }}
          className="header-back"
        >
          ← Missions
        </button>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <span className="header-id">{String(level.id).padStart(2, '0')}</span>
          <span className="header-name">{level.name}</span>
        </div>

        <div className="header-right">
          {cansLeft > 0 && status === 'playing' && (
            <button
              onClick={() => setThrowMode(m => !m)}
              className={`can-btn${throwMode ? ' can-btn--active' : ''}`}
              title="Throw can to distract enemies"
            >
              <span className="can-icon">🥫</span>
              <span className="can-count">×{cansLeft}</span>
            </button>
          )}
          <div className="header-moves-badge">
            <span className="header-moves">{moves}</span>
            <span className="header-moves-label">moves</span>
          </div>
        </div>
      </div>

      {/* Throw mode banner */}
      {throwMode && (
        <div className="throw-banner">
          Select target node to throw can
          <button onClick={() => setThrowMode(false)} className="throw-cancel">Cancel</button>
        </div>
      )}

      {/* Board */}
      <div className="board-wrap">
        <div className="board-inner">
          <GameBoard level={level} state={gameState} onMove={handleNodeClick} throwMode={throwMode} />

          {/* Dead overlay */}
          {status === 'dead' && (
            <div className="overlay">
              <p className="overlay-sub" style={{ color: 'var(--red)' }}>Mission Failed</p>
              <p className="overlay-title" style={{ color: '#f87171' }}>YOU WERE SPOTTED</p>
              <p style={{ height: '1.5rem' }} />
              <div className="overlay-btns">
                <button
                  onClick={restart}
                  style={pillBtn('#f87171', '#7f1d1d')}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 14px rgba(239,68,68,0.3)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Won overlay */}
          {status === 'won' && (
            <div className="overlay">
              <p className="overlay-sub" style={{ color: 'var(--green)' }}>Mission Complete</p>
              <p className="overlay-title" style={{ color: 'var(--gold)' }}>TARGET ELIMINATED</p>
              <p className="overlay-moves">{moves} moves</p>
              <div className="overlay-btns">
                <button
                  onClick={restart}
                  style={pillBtn('var(--text-dim)', 'var(--border)')}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 10px rgba(255,255,255,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  Replay
                </button>
                <button
                  onClick={levelIndex + 1 < levels.length ? nextLevel : () => setScreen('select')}
                  style={pillBtn('var(--gold)', 'rgba(244,180,0,0.4)')}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 14px var(--gold-glow)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {levelIndex + 1 < levels.length ? 'Next Mission' : 'All Missions'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
