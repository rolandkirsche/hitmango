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
  const [canMode, setCanMode] = useState(false);

  const startLevel = useCallback((idx: number) => {
    setLevelIndex(idx);
    setGameState(initState(levels[idx]));
    setCanMode(false);
    setScreen('game');
  }, []);

  useEffect(() => {
    if (gameState.status === 'won') {
      setCompleted(c => c.includes(levelIndex) ? c : [...c, levelIndex]);
      setCanMode(false);
    }
    if (gameState.status === 'dead') setCanMode(false);
  }, [gameState.status, levelIndex]);

  const handleMove = useCallback((nodeId: NodeId) => {
    setGameState(prev => movePlayer(prev, nodeId, levels[levelIndex]));
  }, [levelIndex]);

  const handleCanThrow = useCallback((nodeId: NodeId) => {
    setGameState(prev => throwCan(prev, nodeId));
    setCanMode(false);
  }, []);

  const restart = useCallback(() => {
    setGameState(initState(levels[levelIndex]));
    setCanMode(false);
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', minWidth: '80px', justifyContent: 'flex-end' }}>
          {/* Can throw button */}
          {cansLeft > 0 && status === 'playing' && (
            <button
              onClick={() => setCanMode(c => !c)}
              title="Throw can to distract guards"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: canMode ? '#e0a830' : 'var(--text-dim)',
                background: canMode ? 'rgba(200,160,40,0.12)' : 'none',
                border: `1px solid ${canMode ? '#a07820' : 'var(--border)'}`,
                borderRadius: '2px',
                padding: '0.3rem 0.6rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <span style={{ fontSize: '0.75rem' }}>⊙</span>
              <span>{cansLeft}</span>
            </button>
          )}
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--text)' }}>{moves}</span>
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
      </div>

      {/* Can mode hint bar */}
      {canMode && status === 'playing' && (
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '28px',
          background: 'rgba(180,130,20,0.12)',
          borderBottom: '1px solid rgba(180,130,20,0.3)',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.5rem',
            letterSpacing: '0.25em',
            color: '#c8960c',
            textTransform: 'uppercase',
          }}>
            select target node — esc to cancel
          </span>
        </div>
      )}

      {/* Board */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{
          position: 'relative',
          width: 'min(100%, calc((100dvh - 84px) * 4 / 3))',
          maxWidth: '860px',
          aspectRatio: '4/3',
        }}>
          <GameBoard
            level={level}
            state={gameState}
            onMove={handleMove}
            canMode={canMode && status === 'playing'}
            onCanThrow={handleCanThrow}
          />

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
              <button onClick={restart} style={{ ...overlayBtn, color: '#c04040', border: '1px solid #601010' }}>
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
