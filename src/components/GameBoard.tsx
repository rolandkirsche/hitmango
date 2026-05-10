'use client';

import { useMemo, ReactElement } from 'react';
import { Level, GameState, GameNode, NodeId } from '@/lib/types';
import { getAdjacentNodes, getEnemyNode, getEnemyFacingNode } from '@/lib/gameEngine';

interface Props {
  level: Level;
  state: GameState;
  onMove: (nodeId: NodeId) => void;
  throwMode?: boolean;
}

const W = 800;
const H = 600;
const ISO_SX = 0.55;
const ISO_SY = 0.28;

function buildIso(nodes: GameNode[]) {
  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const ox = W / 2 - (cx - cy) * ISO_SX;
  const oy = H / 2 - (cx + cy) * ISO_SY;
  return (wx: number, wy: number) => ({
    x: ox + (wx - wy) * ISO_SX,
    y: oy + (wx + wy) * ISO_SY,
  });
}

function pStr(pts: Array<{ x: number; y: number }>) {
  return pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

function Base({ x, y, color, shadowColor }: { x: number; y: number; color: string; shadowColor: string }) {
  return (
    <>
      <ellipse cx={x + 1.5} cy={y + 3} rx={11} ry={4} fill="rgba(0,0,0,0.3)" />
      <ellipse cx={x} cy={y}   rx={11} ry={4} fill={shadowColor} />
      <ellipse cx={x} cy={y - 2} rx={10} ry={3.2} fill={color} />
      <ellipse cx={x - 3} cy={y - 3} rx={3.5} ry={1.2} fill="rgba(255,255,255,0.12)" />
    </>
  );
}

// Agent 47 — black suit, white shirt, red tie, bald head, silenced pistol
function AgentPiece({ x, y }: { x: number; y: number }) {
  const bx = x, by = y;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <Base x={bx} y={by + 17} color="#1e1e2a" shadowColor="#0a0a10" />
      <path d={`M${bx-6},${by+10} C${bx-8},${by+3} ${bx-8},${by-4} ${bx-5.5},${by-10}
          L${bx-3.5},${by-14} L${bx+3.5},${by-14} L${bx+5.5},${by-10}
          C${bx+8},${by-4} ${bx+8},${by+3} ${bx+6},${by+10} Z`} fill="#1c1c26" />
      <path d={`M${bx-6},${by+10} C${bx-8},${by+3} ${bx-8},${by-4} ${bx-5.5},${by-10}
          L${bx-3.5},${by-14} L${bx},${by-14} L${bx},${by+10} Z`} fill="rgba(0,0,0,0.22)" />
      <path d={`M${bx-3.5},${by-14} L${bx-1},${by-7} L${bx-1.5},${by-11} Z`} fill="#262632" />
      <path d={`M${bx+3.5},${by-14} L${bx+1},${by-7} L${bx+1.5},${by-11} Z`} fill="#262632" />
      <path d={`M${bx-1.4},${by-13} L${bx+1.4},${by-13} L${bx+1.8},${by-1} L${bx},${by+1.5} L${bx-1.8},${by-1} Z`} fill="#e8e4da" />
      <path d={`M${bx-1},${by-13} L${bx+1},${by-13} L${bx+1.3},${by-5} L${bx},${by-2.5} L${bx-1.3},${by-5} Z`} fill="#a81010" />
      {/* Silenced pistol — left hand */}
      <rect x={bx-12} y={by+2} width={8} height={4} rx={1} fill="#2a2a2a" />
      <rect x={bx-14} y={by+3} width={4} height={2} rx={0.5} fill="#1a1a1a" />
      <rect x={bx-11} y={by+1} width={3} height={2} rx={0.5} fill="#3a3a3a" />
      <rect x={bx-10} y={by+3.5} width={5} height={1} fill="#484848" />
      <rect x={bx} y={by+2} width={3} height={1.5} rx={0.5} fill="#1c1c26" />
      <rect x={bx - 2} y={by - 18} width={4} height={5} rx={1.5} fill="#c8a080" />
      <circle cx={bx} cy={by - 24} r={7} fill="url(#hm-skin-47)" />
      <ellipse cx={bx - 6.5} cy={by - 23} rx={1.5} ry={2.2} fill="#b89068" />
      <ellipse cx={bx + 6.5} cy={by - 23} rx={1.5} ry={2.2} fill="#a07850" />
      <ellipse cx={bx - 2.5} cy={by - 27.5} rx={2.5} ry={1.8} fill="rgba(255,225,185,0.42)" />
    </g>
  );
}

// Patrol guard — blue uniform, visible handgun at hip
function GuardPiece({ x, y }: { x: number; y: number }) {
  const bx = x, by = y;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <Base x={bx} y={by + 17} color="#2a50a0" shadowColor="#162840" />
      <path d={`M${bx-7},${by+10} C${bx-10},${by+2} ${bx-10},${by-5} ${bx-7},${by-11}
          L${bx-5},${by-15} L${bx+5},${by-15} L${bx+7},${by-11}
          C${bx+10},${by-5} ${bx+10},${by+2} ${bx+7},${by+10} Z`} fill="#3262b8" />
      <path d={`M${bx-7},${by+10} C${bx-10},${by+2} ${bx-10},${by-5} ${bx-7},${by-11}
          L${bx-5},${by-15} L${bx},${by-15} L${bx},${by+10} Z`} fill="rgba(0,0,0,0.18)" />
      <path d={`M${bx+7},${by+10} C${bx+10},${by+2} ${bx+10},${by-5} ${bx+7},${by-11}
          L${bx+5},${by-15} L${bx},${by-15} L${bx},${by+10} Z`} fill="rgba(100,160,255,0.1)" />
      <path d={`M${bx-3},${by-13} L${bx+3},${by-13} L${bx+2.5},${by-10} L${bx},${by-9} L${bx-2.5},${by-10} Z`} fill="#4888e0" />
      <rect x={bx - 7} y={by + 3} width={14} height={2.5} rx={0.8} fill="#1e3870" />
      {/* Handgun — right hip, prominent */}
      <rect x={bx+6} y={by+2} width={6} height={8} rx={1} fill="#1a1a2a" />
      <rect x={bx+6} y={by+6} width={8} height={3} rx={0.8} fill="#141420" />
      <rect x={bx+7} y={by+2} width={4} height={3} rx={0.5} fill="#252535" />
      <line x1={bx+10} y1={by+6} x2={bx+14} y2={by+7} stroke="#0a0a18" strokeWidth={1.5} strokeLinecap="round" />
      <rect x={bx - 2.2} y={by - 18} width={4.4} height={5} rx={1.5} fill="#c8a080" />
      <circle cx={bx} cy={by - 24} r={7} fill="url(#hm-skin-guard)" />
      <ellipse cx={bx - 6.5} cy={by - 23} rx={1.5} ry={2.2} fill="#b89068" />
      <ellipse cx={bx + 6.5} cy={by - 23} rx={1.5} ry={2.2} fill="#a07850" />
      <ellipse cx={bx - 2.5} cy={by - 27.5} rx={2.5} ry={1.8} fill="rgba(255,225,185,0.38)" />
    </g>
  );
}

// Sentry (stationary) — dark navy uniform, rifle at port arms, peaked cap
function SentryPiece({ x, y }: { x: number; y: number }) {
  const bx = x, by = y;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <Base x={bx} y={by + 17} color="#0e1830" shadowColor="#080e1c" />
      <path d={`M${bx-7},${by+10} C${bx-10},${by+2} ${bx-10},${by-5} ${bx-7},${by-11}
          L${bx-5},${by-15} L${bx+5},${by-15} L${bx+7},${by-11}
          C${bx+10},${by-5} ${bx+10},${by+2} ${bx+7},${by+10} Z`} fill="#162040" />
      <path d={`M${bx-7},${by+10} C${bx-10},${by+2} ${bx-10},${by-5} ${bx-7},${by-11}
          L${bx-5},${by-15} L${bx},${by-15} L${bx},${by+10} Z`} fill="rgba(0,0,0,0.25)" />
      {/* Gold trim stripe */}
      <rect x={bx-7} y={by-1} width={14} height={1.5} fill="#a08020" opacity={0.8} />
      <rect x={bx - 7} y={by + 3} width={14} height={2} rx={0.5} fill="#0a1020" />
      {/* Rifle at port arms — diagonal across chest */}
      <line x1={bx-5} y1={by+8} x2={bx+6} y2={by-16}
        stroke="#2a2a1a" strokeWidth={3} strokeLinecap="round" />
      <line x1={bx-5} y1={by+8} x2={bx+6} y2={by-16}
        stroke="#4a4a2a" strokeWidth={1.5} strokeLinecap="round" />
      {/* Barrel */}
      <line x1={bx+4} y1={by-13} x2={bx+8} y2={by-21}
        stroke="#3a3a3a" strokeWidth={1.2} strokeLinecap="round" />
      {/* Bayonet */}
      <line x1={bx+8} y1={by-21} x2={bx+10} y2={by-26}
        stroke="#c0c0a0" strokeWidth={1} strokeLinecap="round" />
      <rect x={bx - 2.2} y={by - 19} width={4.4} height={5} rx={1.5} fill="#c8a080" />
      <circle cx={bx} cy={by - 25} r={6.5} fill="url(#hm-skin-guard)" />
      {/* Peaked cap */}
      <ellipse cx={bx} cy={by-30.5} rx={7.5} ry={2.5} fill="#0e1830" />
      <rect x={bx-6} y={by-34} width={12} height={4} rx={2} fill="#162040" />
      <rect x={bx-8} y={by-31} width={16} height={1.5} rx={0.5} fill="#0a1020" />
      {/* Cap badge */}
      <rect x={bx-1.5} y={by-33} width={3} height={2} rx={0.5} fill="#a08020" />
    </g>
  );
}

// Sniper — crimson ghillie, prominent scoped rifle, can't be killed
function SniperPiece({ x, y }: { x: number; y: number }) {
  const bx = x, by = y;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <Base x={bx} y={by + 17} color="#602828" shadowColor="#300e0e" />
      <path d={`M${bx-7},${by+10} C${bx-10},${by+2} ${bx-10},${by-5} ${bx-7},${by-11}
          L${bx-5},${by-15} L${bx+5},${by-15} L${bx+7},${by-11}
          C${bx+10},${by-5} ${bx+10},${by+2} ${bx+7},${by+10} Z`} fill="#702222" />
      <path d={`M${bx-7},${by+10} C${bx-10},${by+2} ${bx-10},${by-5} ${bx-7},${by-11}
          L${bx-5},${by-15} L${bx},${by-15} L${bx},${by+10} Z`} fill="rgba(0,0,0,0.2)" />
      {/* Ghillie patches */}
      <ellipse cx={bx-3} cy={by-2} rx={4} ry={2.5} fill="#3a4820" opacity={0.5} />
      <ellipse cx={bx+4} cy={by+4} rx={3} ry={2} fill="#2e3a18" opacity={0.4} />
      {/* Sniper rifle — prominent, with scope */}
      <line x1={bx-3} y1={by-14} x2={bx+16} y2={by-8}
        stroke="#1a1a0a" strokeWidth={3} strokeLinecap="round" />
      <line x1={bx-3} y1={by-14} x2={bx+16} y2={by-8}
        stroke="#3a3828" strokeWidth={1.5} strokeLinecap="round" />
      {/* Scope */}
      <rect x={bx+3} y={by-17} width={7} height={3} rx={1.5} fill="#1a1a1a" />
      <rect x={bx+4} y={by-16.5} width={5} height={2} rx={1} fill="#0a2a2a" />
      {/* Scope lens glint */}
      <ellipse cx={bx+9.5} cy={by-15.5} rx={1} ry={1} fill="#4080c0" opacity={0.7} />
      {/* Barrel extension */}
      <line x1={bx+14} y1={by-8.5} x2={bx+20} y2={by-5.5}
        stroke="#2a2a1a" strokeWidth={2} strokeLinecap="round" />
      <rect x={bx - 2.2} y={by - 18} width={4.4} height={5} rx={1.5} fill="#c8a080" />
      <circle cx={bx} cy={by - 24} r={7} fill="url(#hm-skin-guard)" />
      <ellipse cx={bx - 6.5} cy={by - 23} rx={1.5} ry={2.2} fill="#b89068" />
      <ellipse cx={bx - 2.5} cy={by - 27.5} rx={2.5} ry={1.8} fill="rgba(255,225,185,0.35)" />
      {/* Red crosshair badge */}
      <circle cx={bx + 9} cy={by - 2} r={5.5} fill="#300808" stroke="#a02020" strokeWidth={1} />
      <line x1={bx+5} y1={by-2} x2={bx+13} y2={by-2} stroke="#c03030" strokeWidth={0.8} />
      <line x1={bx+9} y1={by-6} x2={bx+9} y2={by+2} stroke="#c03030" strokeWidth={0.8} />
      <circle cx={bx+9} cy={by-2} r={1.2} fill="none" stroke="#c03030" strokeWidth={0.6} />
    </g>
  );
}

// Knife man — olive fatigues, balaclava, large visible blade
function KnifePiece({ x, y }: { x: number; y: number }) {
  const bx = x, by = y;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <Base x={bx} y={by + 17} color="#1e2818" shadowColor="#0a0e08" />
      <path d={`M${bx-7},${by+10} C${bx-10},${by+2} ${bx-10},${by-5} ${bx-7},${by-11}
          L${bx-5},${by-15} L${bx+5},${by-15} L${bx+7},${by-11}
          C${bx+10},${by-5} ${bx+10},${by+2} ${bx+7},${by+10} Z`} fill="#2e3824" />
      <path d={`M${bx-7},${by+10} C${bx-10},${by+2} ${bx-10},${by-5} ${bx-7},${by-11}
          L${bx-5},${by-15} L${bx},${by-15} L${bx},${by+10} Z`} fill="rgba(0,0,0,0.2)" />
      <rect x={bx-7} y={by+3} width={14} height={2.5} rx={0.8} fill="#141a10" />
      {/* Large knife — raised in throwing grip */}
      <path d={`M${bx+4},${by-13} L${bx+14},${by-26} L${bx+15},${by-25} L${bx+6},${by-11} Z`}
        fill="#d0c880" />
      <path d={`M${bx+4},${by-13} L${bx+14},${by-26} L${bx+13.5},${by-26.5} L${bx+3.5},${by-13.5} Z`}
        fill="#f0e8a0" opacity={0.7} />
      {/* Cross guard */}
      <line x1={bx+2} y1={by-14} x2={bx+8} y2={by-10}
        stroke="#806040" strokeWidth={1.8} strokeLinecap="round" />
      {/* Handle */}
      <rect x={bx+2} y={by-14} width={4} height={6} rx={1}
        fill="#3a2010" transform={`rotate(-35,${bx+4},${bx+4})`} />
      <rect x={bx - 2.2} y={by - 18} width={4.4} height={5} rx={1.5} fill="#c8a080" />
      {/* Head with balaclava */}
      <circle cx={bx} cy={by-24} r={7} fill="#1e2010" />
      <rect x={bx-4} y={by-27} width={8} height={3} rx={1} fill="#0a0c08" />
      <rect x={bx-3} y={by-26} width={2.5} height={1.8} rx={0.5} fill="#c09050" opacity={0.85} />
      <rect x={bx+0.5} y={by-26} width={2.5} height={1.8} rx={0.5} fill="#c09050" opacity={0.85} />
    </g>
  );
}

export default function GameBoard({ level, state, onMove, throwMode = false }: Props) {
  const iso = useMemo(() => buildIso(level.nodes), [level.nodes]);

  const adjacentToPlayer = useMemo(
    () => state.status === 'playing' ? getAdjacentNodes(state.playerNode, level) : [],
    [state.playerNode, state.status, level]
  );
  const enemyPositions = useMemo(
    () => new Map(state.enemies.map(e => [getEnemyNode(e), e])),
    [state.enemies]
  );
  const nodeMap = useMemo(
    () => new Map(level.nodes.map(n => [n.id, n])),
    [level.nodes]
  );

  const xs = level.nodes.map(n => n.x);
  const ys = level.nodes.map(n => n.y);
  const padO = 68, padI = 44;
  const oMinX = Math.min(...xs) - padO, oMaxX = Math.max(...xs) + padO;
  const oMinY = Math.min(...ys) - padO, oMaxY = Math.max(...ys) + padO;
  const iMinX = Math.min(...xs) - padI, iMaxX = Math.max(...xs) + padI;
  const iMinY = Math.min(...ys) - padI, iMaxY = Math.max(...ys) + padI;

  const TH = 16;
  const oTL = iso(oMinX, oMinY), oTR = iso(oMaxX, oMinY);
  const oBR = iso(oMaxX, oMaxY), oBL = iso(oMinX, oMaxY);
  const iTL = iso(iMinX, iMinY), iTR = iso(iMaxX, iMinY);
  const iBR = iso(iMaxX, iMaxY), iBL = iso(iMinX, iMaxY);

  const groutLines = useMemo(() => {
    const lines: ReactElement[] = [];
    const steps = [0.2, 0.4, 0.6, 0.8];
    steps.forEach((t, i) => {
      const a = { x: oTL.x + (oTR.x - oTL.x) * t, y: oTL.y + (oTR.y - oTL.y) * t };
      const b = { x: oBL.x + (oBR.x - oBL.x) * t, y: oBL.y + (oBR.y - oBL.y) * t };
      lines.push(<line key={`gx${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
        stroke="#1c2040" strokeWidth={0.8} />);
    });
    steps.forEach((t, i) => {
      const a = { x: oTL.x + (oBL.x - oTL.x) * t, y: oTL.y + (oBL.y - oTL.y) * t };
      const b = { x: oTR.x + (oBR.x - oTR.x) * t, y: oTR.y + (oBR.y - oTR.y) * t };
      lines.push(<line key={`gy${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
        stroke="#1c2040" strokeWidth={0.8} />);
    });
    return lines;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oTL.x, oTL.y, oTR.x, oTR.y, oBR.x, oBR.y, oBL.x, oBL.y]);

  const lawnPts = pStr([iTL, iTR, iBR, iBL]);

  // Can position on board
  const canNode = state.can ? nodeMap.get(state.can) : null;
  const canPos = canNode ? iso(canNode.x, canNode.y) : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', height: '100%' }}>
      <defs>
        {/* roehrenboerse dark-navy environment */}
        <radialGradient id="hm-bg" cx="32%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#1a1f3c" />
          <stop offset="55%" stopColor="#0d1025" />
          <stop offset="100%" stopColor="#050510" />
        </radialGradient>
        <radialGradient id="hm-vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
        </radialGradient>
        {/* Dark grid pattern for ground */}
        <pattern id="hm-grass" x="0" y="0" width="18" height="18"
          patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <rect width="18" height="18" fill="#0b1020" />
          <line x1="0" y1="18" x2="18" y2="0" stroke="#151c30" strokeWidth="0.8" opacity="0.7" />
          <line x1="-9" y1="18" x2="9" y2="0"  stroke="#151c30" strokeWidth="0.4" opacity="0.35" />
          <line x1="9"  y1="18" x2="27" y2="0"  stroke="#151c30" strokeWidth="0.4" opacity="0.35" />
        </pattern>
        <clipPath id="hm-lawn-clip">
          <polygon points={lawnPts} />
        </clipPath>
        <radialGradient id="hm-skin-47" cx="36%" cy="28%" r="62%">
          <stop offset="0%" stopColor="#ddb880" />
          <stop offset="55%" stopColor="#bf9060" />
          <stop offset="100%" stopColor="#7a5038" />
        </radialGradient>
        <radialGradient id="hm-skin-guard" cx="36%" cy="28%" r="62%">
          <stop offset="0%" stopColor="#ddb880" />
          <stop offset="55%" stopColor="#bf9060" />
          <stop offset="100%" stopColor="#7a5038" />
        </radialGradient>
        <filter id="hm-piece" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#000" floodOpacity="0.5" />
        </filter>
        <filter id="hm-exit" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="hm-move" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="hm-board-shadow" x="-30%" y="-50%" width="160%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id="hm-throw" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width={W} height={H} fill="url(#hm-bg)" />
      <rect width={W} height={H} fill="url(#hm-vignette)" />

      {/* Board shadow */}
      <ellipse
        cx={(oBL.x + oBR.x) / 2} cy={(oBL.y + oBR.y) / 2 + TH + 14}
        rx={(oBR.x - oBL.x) * 0.52} ry={16}
        fill="rgba(0,0,0,0.5)" filter="url(#hm-board-shadow)"
      />
      {/* Board 3D sides — dark navy */}
      <polygon points={pStr([oBL, oBR, { x: oBR.x, y: oBR.y + TH }, { x: oBL.x, y: oBL.y + TH }])} fill="#0a0e20" />
      <polygon points={pStr([oTR, oBR, { x: oBR.x, y: oBR.y + TH }, { x: oTR.x, y: oTR.y + TH }])} fill="#080c1c" />
      {/* Gold edge lines */}
      <line x1={oBL.x} y1={oBL.y + TH} x2={oBR.x} y2={oBR.y + TH} stroke="rgba(244,180,0,0.2)" strokeWidth={1} />
      <line x1={oTR.x} y1={oTR.y + TH} x2={oBR.x} y2={oBR.y + TH} stroke="rgba(244,180,0,0.12)" strokeWidth={1} />
      {/* Board top — dark navy tile surface */}
      <polygon points={pStr([oTL, oTR, oBR, oBL])} fill="#0f1428" />
      {/* Grout lines in dark navy */}
      {groutLines}
      {/* Board border — subtle gold */}
      <polygon points={pStr([oTL, oTR, oBR, oBL])} fill="none"
        stroke="rgba(244,180,0,0.15)" strokeWidth={1} />
      {/* Grid ground */}
      <rect width={W} height={H} fill="url(#hm-grass)" clipPath="url(#hm-lawn-clip)" />
      {/* Inner shadow */}
      <polygon points={lawnPts} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={5} />
      <polygon points={lawnPts} fill="none" stroke="rgba(244,180,0,0.08)" strokeWidth={1} />

      {/* Path edges */}
      {level.edges.map((edge, i) => {
        const f = nodeMap.get(edge.from), t = nodeMap.get(edge.to);
        if (!f || !t) return null;
        const fp = iso(f.x, f.y), tp = iso(t.x, t.y);
        return <line key={i} x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
          stroke="rgba(244,180,0,0.22)" strokeWidth={2} strokeLinecap="round" />;
      })}

      {/* Enemy facing: arrows (patrol) + knife trajectories */}
      {state.enemies.map(enemy => {
        const facingId = getEnemyFacingNode(enemy);
        if (!facingId) return null;
        const fn = nodeMap.get(getEnemyNode(enemy));
        const tn = nodeMap.get(facingId);
        if (!fn || !tn) return null;
        const fp = iso(fn.x, fn.y), tp = iso(tn.x, tn.y);
        const dx = tp.x - fp.x, dy = tp.y - fp.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const ux = dx / len, uy = dy / len;

        if (enemy.type === 'knife') {
          return (
            <g key={enemy.id + '-k'}>
              <line x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
                stroke="#d08020" strokeWidth={1.4} strokeDasharray="4 3" opacity={0.75} />
              <polygon
                points={`${tp.x + ux*7},${tp.y + uy*7} ${tp.x - ux*7 - uy*5},${tp.y - uy*7 + ux*5} ${tp.x - ux*7 + uy*5},${tp.y - uy*7 - ux*5}`}
                fill="#e09030" opacity={0.9}
              />
              <circle cx={tp.x} cy={tp.y} r={13}
                fill="rgba(220,120,0,0.08)" stroke="#c07020" strokeWidth={1}
                strokeDasharray="3 3" opacity={0.7} />
            </g>
          );
        }

        if (enemy.type === 'sniper') {
          return (
            <line key={enemy.id + '-sn'}
              x1={fp.x} y1={fp.y} x2={fp.x + ux * 999} y2={fp.y + uy * 999}
              stroke="#cc2020" strokeWidth={1} strokeDasharray="2 5" opacity={0.35} />
          );
        }

        const mx = fp.x + dx * 0.53, my = fp.y + dy * 0.53;
        const s = 8, w = 5;
        return (
          <polygon key={enemy.id + '-a'}
            points={`${mx + ux*s},${my + uy*s} ${mx - ux*s - uy*w},${my - uy*s + ux*w} ${mx - ux*s + uy*w},${my - uy*s - ux*w}`}
            fill="#cc1818" opacity={0.85}
          />
        );
      })}

      {/* Nodes + pieces */}
      {level.nodes.map(node => {
        const p = iso(node.x, node.y);
        const isExit   = node.id === level.exit;
        const isPlayer = node.id === state.playerNode;
        const enemy    = enemyPositions.get(node.id);
        const isAdj    = adjacentToPlayer.includes(node.id);
        const isThrowTarget = throwMode && state.status === 'playing';
        const canClick = isThrowTarget || isAdj || isPlayer;

        return (
          <g key={node.id}>
            {/* Throw mode: all nodes highlighted */}
            {isThrowTarget && !isPlayer && (
              <circle cx={p.x} cy={p.y} r={15}
                fill="rgba(200,140,0,0.12)"
                stroke="#c08020" strokeWidth={1}
                strokeDasharray="2 4" opacity={0.6}
                filter="url(#hm-throw)"
              />
            )}

            {/* Wait ring */}
            {isPlayer && state.status === 'playing' && !throwMode && (
              <circle cx={p.x} cy={p.y} r={17}
                fill="none" stroke="rgba(244,180,0,0.5)" strokeWidth={1.2}
                strokeDasharray="3 4" />
            )}

            {/* Move highlight */}
            {isAdj && !throwMode && (
              <circle cx={p.x} cy={p.y} r={15}
                fill="rgba(244,180,0,0.08)"
                stroke="rgba(244,180,0,0.6)" strokeWidth={1.5}
                filter="url(#hm-move)"
              />
            )}

            {/* Node disc */}
            {isExit ? (
              <g filter="url(#hm-exit)">
                <circle cx={p.x} cy={p.y} r={8}
                  fill="none" stroke="#f4b400" strokeWidth={2.5}>
                  <animate attributeName="r"       values="7;12;7"   dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.15;1" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx={p.x} cy={p.y} r={3.5} fill="#f4b400"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(244,180,0,0.8))' }} />
              </g>
            ) : (
              <>
                <circle cx={p.x + 0.5} cy={p.y + 1.5} r={6.5} fill="rgba(0,0,0,0.4)" />
                <circle cx={p.x} cy={p.y} r={6}
                  fill={isPlayer && !enemy ? 'rgba(244,180,0,0.15)' : '#0f1428'}
                  stroke={isPlayer && !enemy ? '#f4b400' : '#272b3d'}
                  strokeWidth={1.5}
                />
                <ellipse cx={p.x - 1.5} cy={p.y - 1.8} rx={2} ry={1.2} fill="rgba(255,255,255,0.07)" />
              </>
            )}

            {/* Pieces */}
            {isPlayer && (
              <g filter="url(#hm-piece)">
                <AgentPiece x={p.x} y={p.y - 8} />
              </g>
            )}
            {enemy && !isPlayer && (
              <g filter="url(#hm-piece)">
                {enemy.type === 'sniper'
                  ? <SniperPiece  x={p.x} y={p.y - 8} />
                  : enemy.type === 'knife'
                  ? <KnifePiece   x={p.x} y={p.y - 8} />
                  : enemy.type === 'stationary'
                  ? <SentryPiece  x={p.x} y={p.y - 8} />
                  : <GuardPiece   x={p.x} y={p.y - 8} />
                }
              </g>
            )}

            {/* Click target */}
            {canClick && (
              <circle cx={p.x} cy={p.y} r={22}
                fill="transparent"
                onClick={() => onMove(node.id)}
                style={{ cursor: throwMode ? 'crosshair' : 'pointer' }}
              />
            )}
          </g>
        );
      })}

      {/* Can visual */}
      {canPos && (
        <g>
          <ellipse cx={canPos.x} cy={canPos.y + 8} rx={7} ry={3} fill="rgba(0,0,0,0.2)" />
          <rect x={canPos.x - 4} y={canPos.y - 4} width={8} height={12} rx={2} fill="#c8a030" />
          <rect x={canPos.x - 4} y={canPos.y - 4} width={8} height={3} rx={1} fill="#e0b840" />
          <rect x={canPos.x - 4} y={canPos.y + 5} width={8} height={3} rx={1} fill="#a07818" />
          <line x1={canPos.x-3} y1={canPos.y-1} x2={canPos.x+3} y2={canPos.y-1}
            stroke="#e8c040" strokeWidth={0.5} opacity={0.5} />
        </g>
      )}
    </svg>
  );
}
