'use client';

import { levels } from '@/lib/levels';

interface Props {
  onSelect: (levelIndex: number) => void;
  completed: number[];
}

const TYPE_COLOR: Record<string, string> = {
  sniper:     '#ef4444',
  knife:      '#f4b400',
  stationary: '#3b82f6',
  patrol:     '#6b7280',
};

export default function LevelSelect({ onSelect, completed }: Props) {
  return (
    <div className="level-select-wrap">
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48, height: 48,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #facc15 0%, #b45309 60%, #111827 100%)',
          boxShadow: '0 0 18px rgba(245,158,11,0.55)',
          marginBottom: '1rem',
        }}>
          <span style={{ fontSize: '1.3rem' }}>🎯</span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 7vw, 3.5rem)',
          fontWeight: 900,
          color: 'var(--text)',
          letterSpacing: '0.18em',
          lineHeight: 1,
        }}>
          HITMAN
        </h1>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.5em',
          color: 'var(--text-dim)',
          marginTop: '0.4rem',
          textTransform: 'uppercase',
        }}>
          GO
        </p>
        <div style={{ margin: '1rem auto 0', width: '80px', height: '1px', background: 'var(--border)' }} />
      </div>

      {/* Level grid */}
      <div className="level-grid">
        {levels.map((level, i) => {
          const done = completed.includes(i);
          return (
            <button
              key={level.id}
              onClick={() => onSelect(i)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
            >
              <div
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  background: done ? 'rgba(34,197,94,0.06)' : 'var(--surface)',
                  border: `1px solid ${done ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                  boxShadow: done ? '0 0 20px rgba(34,197,94,0.08)' : 'none',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = done ? 'rgba(34,197,94,0.5)' : 'var(--gold)';
                  el.style.boxShadow = done
                    ? '0 0 20px rgba(34,197,94,0.15)'
                    : '0 0 18px var(--gold-glow)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = done ? 'rgba(34,197,94,0.25)' : 'var(--border)';
                  el.style.boxShadow = done ? '0 0 20px rgba(34,197,94,0.08)' : 'none';
                }}
              >
                {/* Level number */}
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.5rem, 4vw, 2.4rem)',
                  fontWeight: 900,
                  color: done ? 'var(--green)' : 'var(--gold)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  textShadow: done
                    ? '0 0 12px rgba(34,197,94,0.5)'
                    : '0 0 12px rgba(244,180,0,0.4)',
                }}>
                  {String(level.id).padStart(2, '0')}
                </div>

                {/* Level name */}
                <div style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '9px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: done ? 'var(--green)' : 'var(--text-dim)',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  padding: '0 0.5rem',
                  opacity: done ? 0.8 : 0.7,
                }}>
                  {level.name}
                </div>

                {/* Done badge */}
                {done && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    background: 'rgba(34,197,94,0.12)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '1px 6px',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '8px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'var(--green)',
                    textTransform: 'uppercase',
                  }}>
                    ✓ done
                  </div>
                )}

                {/* Can indicator */}
                {(level.cans ?? 0) > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 7, right: 8,
                    fontSize: '0.65rem',
                    opacity: 0.55,
                  }}>🥫</div>
                )}

                {/* Enemy type pips */}
                <div style={{
                  position: 'absolute',
                  bottom: 7, left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '3px',
                }}>
                  {level.enemies.map((e, j) => (
                    <div key={j} style={{
                      width: 5, height: 5,
                      borderRadius: '50%',
                      background: TYPE_COLOR[e.type] ?? '#6b7280',
                      boxShadow: `0 0 4px ${TYPE_COLOR[e.type] ?? '#6b7280'}88`,
                    }} />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p style={{
        marginTop: '2rem',
        fontFamily: 'var(--font-ui)',
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.25em',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
      }}>
        Select Mission
      </p>
    </div>
  );
}
