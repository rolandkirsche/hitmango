'use client';

import { levels } from '@/lib/levels';

interface Props {
  onSelect: (levelIndex: number) => void;
  completed: number[];
}

export default function LevelSelect({ onSelect, completed }: Props) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '3rem 1rem 2rem',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '4rem',
          fontWeight: 900,
          color: 'var(--text)',
          letterSpacing: '0.22em',
          lineHeight: 1,
        }}>
          TILE ASSASSIN
        </h1>
        <div style={{
          margin: '1.25rem auto 0',
          width: '120px',
          height: '1px',
          background: 'var(--border)',
        }} />
      </div>

      {/* Level grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 148px)',
        gap: '1.25rem',
      }}>
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
                  width: '148px',
                  height: '148px',
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
                {/* Level number */}
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.8rem',
                  fontWeight: 900,
                  color: done ? '#00c870' : 'var(--text)',
                  lineHeight: 1,
                  opacity: done ? 1 : 0.9,
                }}>
                  {String(level.id).padStart(2, '0')}
                </div>

                {/* Level name */}
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.52rem',
                  letterSpacing: '0.2em',
                  color: done ? '#2a8050' : 'var(--text-dim)',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  padding: '0 0.75rem',
                }}>
                  {level.name}
                </div>

                {/* Done badge */}
                {done && (
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.48rem',
                    letterSpacing: '0.2em',
                    color: '#00c870',
                    textTransform: 'uppercase',
                    marginTop: '0.15rem',
                  }}>
                    ✓ complete
                  </div>
                )}

                {/* Enemy pip count */}
                <div style={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  display: 'flex',
                  gap: '3px',
                }}>
                  {Array.from({ length: level.enemies.length }, (_, j) => (
                    <div key={j} style={{
                      width: 4, height: 4,
                      borderRadius: '50%',
                      background: '#601010',
                    }} />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p style={{
        marginTop: '3rem',
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
