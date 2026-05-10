'use client';

import { useState, useCallback, useEffect } from 'react';
import { levels } from '@/lib/levels';
import { initState, movePlayer, throwCan } from '@/lib/gameEngine';
import { GameState, NodeId } from '@/lib/types';
import GameBoard from '@/components/GameBoard';
import LevelSelect from '@/components/LevelSelect';

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

  const overlayBtn: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    padding: '0.7rem 1.8rem',
    borderRadius: '2px',
    cursor: 'pointer',
    background: 'none',
    transition: 'opacity 0.15s',
  };

  return (
    <div className="game-root">
      {/* Header */}
      <div className="game-header">
        <button
          onClick={() => { setScreen('select'); setThrowMode(false); }}
          className="header-back"
        >
          ← missions
        </button>

        <div style={{ textAlign: 'center' }}>
          <span className="header-id">
            {String(level.id).padStart(2, '0')}
          </span>
          <span className="header-name">
            {level.name.toUpperCase()}
          </span>
        </div>

        <div className="header-right">
          {/* Can throw button */}
          {cansLeft > 0 && status === 'playing' && (
            <button
              onClick={() => setThrowMode(m => !m)}
              className={`can-btn${throwMode ? ' can-btn--active' : ''}`}
              title="Throw can to distract enemies"
            >
              <span className="can-icon">🥫</span>
              <span className="can-count">{cansLeft}</span>
            </button>
          )}
          <span className="header-moves">{moves}</span>
          <span className="header-moves-label">moves</span>
        </div>
      </div>

      {/* Throw mode banner */}
      {throwMode && (
        <div className="throw-banner">
          Click any node to throw can — distracts patrol enemies for 1 turn
          <button onClick={() => setThrowMode(false)} className="throw-cancel">cancel</button>
        </div>
      )}

      {/* Board */}
      <div className="board-wrap">
        <div className="board-inner">
          <GameBoard level={level} state={gameState} onMove={handleNodeClick} throwMode={throwMode} />

          {/* Dead overlay */}
          {status === 'dead' && (
            <div className="overlay">
              <p className="overlay-sub" style={{ color: '#601010' }}>mission failed</p>
              <p className="overlay-title" style={{ color: '#c02020' }}>YOU WERE SPOTTED</p>
              <button onClick={restart} style={{ ...overlayBtn, color: '#c04040', border: '1px solid #601010' }}>
                retry
              </button>
            </div>
          )}

          {/* Won overlay */}
          {status === 'won' && (
            <div className="overlay">
              <p className="overlay-sub" style={{ color: '#186030' }}>mission complete</p>
              <p className="overlay-title" style={{ color: '#00c870' }}>TARGET ELIMINATED</p>
              <p className="overlay-moves">{moves} moves</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={restart} style={{ ...overlayBtn, color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
                  replay
                </button>
                <button
                  onClick={levelIndex + 1 < levels.length ? nextLevel : () => setScreen('select')}
                  style={{ ...overlayBtn, color: '#00c870', border: '1px solid #186030' }}
                >
                  {levelIndex + 1 < levels.length ? 'next mission' : 'all missions'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
