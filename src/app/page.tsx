'use client';

import { useState, useCallback, useEffect } from 'react';
import { levels } from '@/lib/levels';
import { initState, movePlayer } from '@/lib/gameEngine';
import { GameState, NodeId } from '@/lib/types';
import GameBoard from '@/components/GameBoard';
import LevelSelect from '@/components/LevelSelect';

export default function Home() {
  const [screen, setScreen] = useState<'select' | 'game'>('select');
  const [levelIndex, setLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>(() => initState(levels[0]));
  const [completed, setCompleted] = useState<number[]>([]);

  const startLevel = useCallback((idx: number) => {
    setLevelIndex(idx);
    setGameState(initState(levels[idx]));
    setScreen('game');
  }, []);

  useEffect(() => {
    if (gameState.status === 'won') {
      setCompleted(c => c.includes(levelIndex) ? c : [...c, levelIndex]);
    }
  }, [gameState.status, levelIndex]);

  const handleMove = useCallback((nodeId: NodeId) => {
    setGameState(prev => movePlayer(prev, nodeId, levels[levelIndex]));
  }, [levelIndex]);

  const restart = useCallback(() => {
    setGameState(initState(levels[levelIndex]));
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
  const { status, moves } = gameState;

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
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        height: '52px',
        borderBottom: '1px solid var(--border)',
      }}>
        <button
          onClick={() => setScreen('select')}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
        >
          ← missions
        </button>

        <div style={{ textAlign: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            letterSpacing: '0.22em',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            marginRight: '1rem',
          }}>
            {String(level.id).padStart(2, '0')}
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.85rem',
            letterSpacing: '0.2em',
            color: 'var(--text)',
          }}>
            {level.name.toUpperCase()}
          </span>
        </div>

        <div style={{ textAlign: 'right', minWidth: '80px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.1rem',
            color: 'var(--text)',
          }}>{moves}</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.5rem',
            letterSpacing: '0.2em',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            marginLeft: '0.4rem',
          }}>moves</span>
        </div>
      </div>

      {/* Board */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '860px',
          aspectRatio: '4/3',
        }}>
          <GameBoard level={level} state={gameState} onMove={handleMove} />

          {/* Dead overlay */}
          {status === 'dead' && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(4,2,2,0.78)',
              backdropFilter: 'blur(3px)',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.35em',
                color: '#601010',
                textTransform: 'uppercase',
                marginBottom: '0.6rem',
              }}>mission failed</p>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                letterSpacing: '0.12em',
                color: '#c02020',
                marginBottom: '2.5rem',
              }}>YOU WERE SPOTTED</p>
              <button onClick={restart} style={{
                ...overlayBtn,
                color: '#c04040',
                border: '1px solid #601010',
              }}>
                retry
              </button>
            </div>
          )}

          {/* Won overlay */}
          {status === 'won' && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(2,6,4,0.78)',
              backdropFilter: 'blur(3px)',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.35em',
                color: '#186030',
                textTransform: 'uppercase',
                marginBottom: '0.6rem',
              }}>mission complete</p>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                letterSpacing: '0.12em',
                color: '#00c870',
                marginBottom: '0.4rem',
              }}>TARGET ELIMINATED</p>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.2em',
                color: '#206040',
                marginBottom: '2.5rem',
              }}>{moves} moves</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={restart} style={{
                  ...overlayBtn,
                  color: 'var(--text-dim)',
                  border: '1px solid var(--border)',
                }}>
                  replay
                </button>
                <button
                  onClick={levelIndex + 1 < levels.length ? nextLevel : () => setScreen('select')}
                  style={{
                    ...overlayBtn,
                    color: '#00c870',
                    border: '1px solid #186030',
                  }}
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
