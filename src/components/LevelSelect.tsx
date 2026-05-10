'use client';

import { levels } from '@/lib/levels';

interface Props {
  onSelect: (levelIndex: number) => void;
  completed: number[];
}

function BoardPreview() {
  return (
    <svg
      width="280" height="160"
      viewBox="0 0 280 160"
      style={{ display: 'block', borderRadius: '3px', border: '1px solid var(--border)' }}
    >
      <defs>
        <radialGradient id="prev-bg" cx="30%" cy="25%" r="90%">
          <stop offset="0%" stopColor="#bdc7d0" />
          <stop offset="100%" stopColor="#748898" />
        </radialGradient>
        <radialGradient id="prev-skin" cx="36%" cy="28%" r="62%">
          <stop offset="0%" stopColor="#ddb880" />
          <stop offset="60%" stopColor="#bf9060" />
          <stop offset="100%" stopColor="#7a5038" />
        </radialGradient>
        <pattern id="prev-grass" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <rect width="14" height="14" fill="#4a7238" />
          <line x1="0" y1="14" x2="14" y2="0" stroke="#3d6230" strokeWidth="0.9" opacity="0.5" />
        </pattern>
        <filter id="prev-exit" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Sky/ground background */}
      <rect width="280" height="160" fill="url(#prev-bg)" />

      {/* Board surface */}
      <polygon points="14,148 140,72 266,148" fill="#c6cdd6" />
      <polygon points="14,148 140,72 266,148" fill="none" stroke="#a8b2bc" strokeWidth="1" />

      {/* Grass lawn */}
      <polygon points="42,148 140,96 238,148" fill="url(#prev-grass)" />
      <polygon points="42,148 140,96 238,148" fill="none" stroke="#3a6028" strokeWidth="1" />

      {/* Edges */}
      <line x1="68" y1="136" x2="115" y2="109" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="115" y1="109" x2="165" y2="130" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="115" y1="109" x2="162" y2="88"  stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="165" y1="130" x2="212" y2="109" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="162" y1="88"  x2="212" y2="109" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />

      {/* Move highlight */}
      <circle cx="115" cy="109" r="11" fill="rgba(200,160,48,0.18)" stroke="#c8a030" strokeWidth="1.2" />

      {/* Node discs */}
      <circle cx="68"  cy="136" r="5" fill="#1e2e50" stroke="#4a70d0" strokeWidth="1" />
      <circle cx="115" cy="109" r="5" fill="#1a1a1a" stroke="#c8a030" strokeWidth="1" />
      <circle cx="165" cy="130" r="5" fill="#1a1a1a" stroke="#333"    strokeWidth="1" />
      <circle cx="162" cy="88"  r="5" fill="#1a1a1a" stroke="#333"    strokeWidth="1" />

      {/* Exit beacon */}
      <g filter="url(#prev-exit)">
        <circle cx="212" cy="109" r="7" fill="none" stroke="#00c060" strokeWidth="2.5">
          <animate attributeName="r"       values="6;10;6"   dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.2;1"  dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="212" cy="109" r="3.5" fill="#00c060" />
      </g>

      {/* Agent piece at node 1 (68,136) */}
      <g>
        <ellipse cx="68" cy="129" rx="8" ry="2.8" fill="#0a0a10" />
        <path d={`M63,123 C62,119 62,114 63.5,111 L65,108 L71,108 L72.5,111 C74,114 74,119 73,123 Z`} fill="#1c1c26" />
        <path d={`M67,108 L69,108 L69.5,117 L68,119 L66.5,117 Z`} fill="#e8e4da" />
        <path d={`M67.5,108 L68.5,108 L68.8,114 L68,116 L67.2,114 Z`} fill="#a81010" />
        <rect x="66.5" y="105" width="3" height="3.5" rx="1.2" fill="#c8a080" />
        <circle cx="68" cy="101" r="5.5" fill="url(#prev-skin)" />
        <ellipse cx="65.5" cy="100" rx="1.3" ry="1.5" fill="#b89068" />
        <ellipse cx="65.8" cy="98.2" rx="2" ry="1.4" fill="rgba(255,225,185,0.4)" />
      </g>

      {/* Guard piece at node 3 (165,130) */}
      <g>
        <ellipse cx="165" cy="123" rx="8.5" ry="3" fill="#0a0a10" />
        <path d={`M160,117 C159,113 159,107 160.5,104 L162,101 L168,101 L169.5,104 C171,107 171,113 170,117 Z`} fill="#3262b8" />
        <path d={`M160,117 C159,113 159,107 160.5,104 L162,101 L165,101 L165,117 Z`} fill="rgba(0,0,0,0.15)" />
        <rect x="159" y="112" width="12" height="2" rx="0.8" fill="#1e3870" />
        <rect x="163" y="98" width="4" height="3.5" rx="1.2" fill="#c8a080" />
        <circle cx="165" cy="94" r="5.5" fill="url(#prev-skin)" />
        <ellipse cx="162.5" cy="93" rx="1.3" ry="1.5" fill="#b89068" />
        <ellipse cx="162.8" cy="91.2" rx="2" ry="1.4" fill="rgba(255,225,185,0.35)" />
      </g>

      {/* Sniper badge at node 4 (162,88) */}
      <g>
        <ellipse cx="162" cy="81" rx="8" ry="2.8" fill="#0a0a10" />
        <path d={`M157,75 C156,71 156,65 157.5,62 L159,59 L165,59 L166.5,62 C168,65 168,71 167,75 Z`} fill="#702222" />
        <circle cx="170" cy="67" r="4" fill="#300808" stroke="#a02020" strokeWidth="1" />
        <line x1="167" y1="67" x2="173" y2="67" stroke="#c03030" strokeWidth="0.8" />
        <line x1="170" y1="64" x2="170" y2="70" stroke="#c03030" strokeWidth="0.8" />
        <rect x="160" y="56" width="4" height="3.5" rx="1.2" fill="#c8a080" />
        <circle cx="162" cy="52" r="5.5" fill="url(#prev-skin)" />
        <ellipse cx="160.5" cy="51" rx="1.3" ry="1.5" fill="#b89068" />
      </g>
    </svg>
  );
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
          fontSize: 'clamp(1.6rem, 6vw, 3.2rem)',
          fontWeight: 900,
          color: 'var(--text)',
          letterSpacing: '0.12em',
          lineHeight: 1,
        }}>
          TILE ASSASSIN
        </h1>
        <div style={{ margin: '1.25rem auto 1.5rem', width: '120px', height: '1px', background: 'var(--border)' }} />
        <BoardPreview />
      </div>

      {/* Level grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 100px))',
        gap: '0.75rem',
        width: '100%',
        maxWidth: '600px',
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
                {/* Level number */}
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.8rem',
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
