'use client';

import { levels } from '@/lib/levels';

interface Props {
  onSelect: (levelIndex: number) => void;
  completed: number[];
}

export default function LevelSelect({ onSelect, completed }: Props) {
  return (
    <div className="level-select-wrap">
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.55rem',
          letterSpacing: '0.6em',
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}>
          Square Enix
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.2rem, 8vw, 4rem)',
          fontWeight: 900,
          color: 'var(--text)',
          letterSpacing: '0.22em',
          lineHeight: 1,
        }}>
          HITMAN
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          letterSpacing: '1.1em',
          color: 'var(--text-dim)',
          marginTop: '0.5rem',
          textTransform: 'uppercase',
        }}>
          go
        </p>
        <div style={{ margin: '1.25rem auto 0', width: '120px', height: '1px', background: 'var(--border)' }} />
      </div>

      {/* Level grid */}
      <div className="level-grid">
        {levels.map((level, i) => {
          const done = completed.includes(i);
          return (
            <button
              key={level.id}
              onClick={() => onSelect(i)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  background: done ? '#0a1810' : 'var(--surface)',
                  border: `1px solid ${done ? '#1a3820' : 'var(--border)'}`,
                  borderRadius: '3px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = done ? '#2a6040' : '#303844';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = done ? '#1a3820' : 'var(--border)';
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
                  fontWeight: 900,
                  color: done ? '#00c870' : 'var(--text)',
                  lineHeight: 1,
                  opacity: done ? 1 : 0.9,
                }}>
                  {String(level.id).padStart(2, '0')}
                </div>

                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.48rem',
                  letterSpacing: '0.18em',
                  color: done ? '#2a8050' : 'var(--text-dim)',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  padding: '0 0.5rem',
                }}>
                  {level.name}
                </div>

                {done && (
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.44rem',
                    letterSpacing: '0.18em',
                    color: '#00c870',
                    textTransform: 'uppercase',
                  }}>
                    ✓ done
                  </div>
                )}

                {/* Can indicator */}
                {(level.cans ?? 0) > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 6, right: 6,
                    fontSize: '0.6rem',
                    opacity: 0.5,
                  }}>🥫</div>
                )}

                {/* Enemy pip count */}
                <div style={{
                  position: 'absolute',
                  bottom: 7, right: 7,
                  display: 'flex',
                  gap: '3px',
                }}>
                  {level.enemies.map((e, j) => (
                    <div key={j} style={{
                      width: 4, height: 4,
                      borderRadius: '50%',
                      background: e.type === 'sniper' ? '#c02020'
                        : e.type === 'knife' ? '#c08020'
                        : e.type === 'stationary' ? '#203060'
                        : '#601010',
                    }} />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p style={{
        marginTop: '2.5rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.5rem',
        letterSpacing: '0.45em',
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
      }}>
        select mission
      </p>
    </div>
  );
}
