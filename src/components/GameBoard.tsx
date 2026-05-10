'use client';

import { useMemo, ReactElement } from 'react';
import { Level, GameState, GameNode, NodeId } from '@/lib/types';
import { getAdjacentNodes, getEnemyNode, getEnemyFacingNode } from '@/lib/gameEngine';

interface Props {
  level: Level;
  state: GameState;
  onMove: (nodeId: NodeId) => void;
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

// Flat ellipse standing in for a board-piece base
function Base({ x, y, color, shadowColor }: { x: number; y: number; color: string; shadowColor: string }) {
  return (
    <>
      <ellipse cx={x + 1.5} cy={y + 3} rx={11} ry={4} fill="rgba(0,0,0,0.3)" />
      <ellipse cx={x} cy={y}   rx={11} ry={4} fill={shadowColor} />
      <ellipse cx={x} cy={y - 2} rx={10} ry={3.2} fill={color} />
      <ellipse cx={x - 3} cy={y - 3} rx={3.5} ry={1.2}
        fill="rgba(255,255,255,0.12)" />
    </>
  );
}

// Agent 47 — black suit, white shirt, red tie, bald head
function AgentPiece({ x, y }: { x: number; y: number }) {
  const bx = x, by = y;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <Base x={bx} y={by + 17} color="#1e1e2a" shadowColor="#0a0a10" />

      {/* Coat body */}
      <path
        d={`M${bx-6},${by+10} C${bx-8},${by+3} ${bx-8},${by-4} ${bx-5.5},${by-10}
            L${bx-3.5},${by-14} L${bx+3.5},${by-14} L${bx+5.5},${by-10}
            C${bx+8},${by-4} ${bx+8},${by+3} ${bx+6},${by+10} Z`}
        fill="#1c1c26"
      />
      {/* Left coat side shadow */}
      <path
        d={`M${bx-6},${by+10} C${bx-8},${by+3} ${bx-8},${by-4} ${bx-5.5},${by-10}
            L${bx-3.5},${by-14} L${bx},${by-14} L${bx},${by+10} Z`}
        fill="rgba(0,0,0,0.22)"
      />
      {/* Right coat highlight */}
      <path
        d={`M${bx+6},${by+10} C${bx+8},${by+3} ${bx+8},${by-4} ${bx+5.5},${by-10}
            L${bx+3.5},${by-14} L${bx},${by-14} L${bx},${by+10} Z`}
        fill="rgba(255,255,255,0.04)"
      />
      {/* Left lapel */}
      <path d={`M${bx-3.5},${by-14} L${bx-1},${by-7} L${bx-1.5},${by-11} Z`}
        fill="#262632" />
      {/* Right lapel */}
      <path d={`M${bx+3.5},${by-14} L${bx+1},${by-7} L${bx+1.5},${by-11} Z`}
        fill="#262632" />
      {/* White shirt */}
      <path d={`M${bx-1.4},${by-13} L${bx+1.4},${by-13} L${bx+1.8},${by-1} L${bx},${by+1.5} L${bx-1.8},${by-1} Z`}
        fill="#e8e4da" />
      {/* Red tie */}
      <path d={`M${bx-1},${by-13} L${bx+1},${by-13} L${bx+1.3},${by-5} L${bx},${by-2.5} L${bx-1.3},${by-5} Z`}
        fill="#a81010" />

      {/* Neck */}
      <rect x={bx - 2} y={by - 18} width={4} height={5} rx={1.5} fill="#c8a080" />
      {/* Head — bald, with gradient */}
      <circle cx={bx} cy={by - 24} r={7} fill="url(#hm-skin-47)" />
      {/* Ear hints */}
      <ellipse cx={bx - 6.5} cy={by - 23} rx={1.5} ry={2.2} fill="#b89068" />
      <ellipse cx={bx + 6.5} cy={by - 23} rx={1.5} ry={2.2} fill="#a07850" />
      {/* Specular shine */}
      <ellipse cx={bx - 2.5} cy={by - 27.5} rx={2.5} ry={1.8}
        fill="rgba(255,225,185,0.42)" />
    </g>
  );
}

// Guard — blue uniform, stockier build
function GuardPiece({ x, y }: { x: number; y: number }) {
  const bx = x, by = y;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <Base x={bx} y={by + 17} color="#2a50a0" shadowColor="#162840" />

      {/* Body */}
      <path
        d={`M${bx-7},${by+10} C${bx-10},${by+2} ${bx-10},${by-5} ${bx-7},${by-11}
            L${bx-5},${by-15} L${bx+5},${by-15} L${bx+7},${by-11}
            C${bx+10},${by-5} ${bx+10},${by+2} ${bx+7},${by+10} Z`}
        fill="#3262b8"
      />
      {/* Left shadow */}
      <path
        d={`M${bx-7},${by+10} C${bx-10},${by+2} ${bx-10},${by-5} ${bx-7},${by-11}
            L${bx-5},${by-15} L${bx},${by-15} L${bx},${by+10} Z`}
        fill="rgba(0,0,0,0.18)"
      />
      {/* Right highlight */}
      <path
        d={`M${bx+7},${by+10} C${bx+10},${by+2} ${bx+10},${by-5} ${bx+7},${by-11}
            L${bx+5},${by-15} L${bx},${by-15} L${bx},${by+10} Z`}
        fill="rgba(100,160,255,0.1)"
      />
      {/* Collar */}
      <path d={`M${bx-3},${by-13} L${bx+3},${by-13} L${bx+2.5},${by-10} L${bx},${by-9} L${bx-2.5},${by-10} Z`}
        fill="#4888e0" />
      {/* Belt line */}
      <rect x={bx - 7} y={by + 3} width={14} height={2.5} rx={0.8} fill="#1e3870" />

      {/* Neck */}
      <rect x={bx - 2.2} y={by - 18} width={4.4} height={5} rx={1.5} fill="#c8a080" />
      {/* Head */}
      <circle cx={bx} cy={by - 24} r={7} fill="url(#hm-skin-guard)" />
      <ellipse cx={bx - 6.5} cy={by - 23} rx={1.5} ry={2.2} fill="#b89068" />
      <ellipse cx={bx + 6.5} cy={by - 23} rx={1.5} ry={2.2} fill="#a07850" />
      <ellipse cx={bx - 2.5} cy={by - 27.5} rx={2.5} ry={1.8}
        fill="rgba(255,225,185,0.38)" />
    </g>
  );
}

// Sniper — darker uniform, can't be killed
function SniperPiece({ x, y }: { x: number; y: number }) {
  const bx = x, by = y;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <Base x={bx} y={by + 17} color="#602828" shadowColor="#300e0e" />
      <path
        d={`M${bx-7},${by+10} C${bx-10},${by+2} ${bx-10},${by-5} ${bx-7},${by-11}
            L${bx-5},${by-15} L${bx+5},${by-15} L${bx+7},${by-11}
            C${bx+10},${by-5} ${bx+10},${by+2} ${bx+7},${by+10} Z`}
        fill="#702222"
      />
      <path
        d={`M${bx-7},${by+10} C${bx-10},${by+2} ${bx-10},${by-5} ${bx-7},${by-11}
            L${bx-5},${by-15} L${bx},${by-15} L${bx},${by+10} Z`}
        fill="rgba(0,0,0,0.2)"
      />
      {/* Rifle hint */}
      <line x1={bx + 3} y1={by - 14} x2={bx + 10} y2={by - 8}
        stroke="#4a2020" strokeWidth={2} strokeLinecap="round" />
      <rect x={bx - 2.2} y={by - 18} width={4.4} height={5} rx={1.5} fill="#c8a080" />
      <circle cx={bx} cy={by - 24} r={7} fill="url(#hm-skin-guard)" />
      <ellipse cx={bx - 6.5} cy={by - 23} rx={1.5} ry={2.2} fill="#b89068" />
      <ellipse cx={bx - 2.5} cy={by - 27.5} rx={2.5} ry={1.8}
        fill="rgba(255,225,185,0.35)" />
      {/* Crosshair badge */}
      <circle cx={bx + 8} cy={by - 2} r={5} fill="#300808" stroke="#a02020" strokeWidth={1} />
      <line x1={bx+5} y1={by-2} x2={bx+11} y2={by-2} stroke="#c03030" strokeWidth={0.8} />
      <line x1={bx+8} y1={by-5} x2={bx+8} y2={by+1} stroke="#c03030" strokeWidth={0.8} />
    </g>
  );
}

export default function GameBoard({ level, state, onMove }: Props) {
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

  // Tile grout lines across the border area
  const groutLines = useMemo(() => {
    const lines: ReactElement[] = [];
    const steps = [0.2, 0.4, 0.6, 0.8];
    steps.forEach((t, i) => {
      const a = { x: oTL.x + (oTR.x - oTL.x) * t, y: oTL.y + (oTR.y - oTL.y) * t };
      const b = { x: oBL.x + (oBR.x - oBL.x) * t, y: oBL.y + (oBR.y - oBL.y) * t };
      lines.push(<line key={`gx${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
        stroke="#aab2bc" strokeWidth={0.8} />);
    });
    steps.forEach((t, i) => {
      const a = { x: oTL.x + (oBL.x - oTL.x) * t, y: oTL.y + (oBL.y - oTL.y) * t };
      const b = { x: oTR.x + (oBR.x - oTR.x) * t, y: oTR.y + (oBR.y - oTR.y) * t };
      lines.push(<line key={`gy${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
        stroke="#aab2bc" strokeWidth={0.8} />);
    });
    return lines;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oTL.x, oTL.y, oTR.x, oTR.y, oBR.x, oBR.y, oBL.x, oBL.y]);

  const lawnPts = pStr([iTL, iTR, iBR, iBL]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', height: '100%' }}>
      <defs>
        {/* Environment gradient */}
        <radialGradient id="hm-bg" cx="30%" cy="22%" r="88%">
          <stop offset="0%" stopColor="#bdc7d0" />
          <stop offset="100%" stopColor="#748898" />
        </radialGradient>
        <radialGradient id="hm-vignette" cx="50%" cy="50%" r="68%">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.48)" />
        </radialGradient>

        {/* Grass texture */}
        <pattern id="hm-grass" x="0" y="0" width="14" height="14"
          patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <rect width="14" height="14" fill="#4a7238" />
          <line x1="0" y1="14" x2="14" y2="0" stroke="#3d6230" strokeWidth="0.9" opacity="0.55" />
          <line x1="-7" y1="14" x2="7" y2="0"  stroke="#3d6230" strokeWidth="0.5" opacity="0.25" />
          <line x1="7"  y1="14" x2="21" y2="0"  stroke="#3d6230" strokeWidth="0.5" opacity="0.25" />
        </pattern>
        <clipPath id="hm-lawn-clip">
          <polygon points={lawnPts} />
        </clipPath>

        {/* Skin gradients */}
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

        {/* Filters */}
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
      </defs>

      {/* Background */}
      <rect width={W} height={H} fill="url(#hm-bg)" />
      <rect width={W} height={H} fill="url(#hm-vignette)" />

      {/* Board ground shadow */}
      <ellipse
        cx={(oBL.x + oBR.x) / 2}
        cy={(oBL.y + oBR.y) / 2 + TH + 10}
        rx={(oBR.x - oBL.x) * 0.55}
        ry={14}
        fill="rgba(0,0,0,0.32)"
        filter="url(#hm-board-shadow)"
      />

      {/* Board 3D sides */}
      <polygon
        points={pStr([oBL, oBR, { x: oBR.x, y: oBR.y + TH }, { x: oBL.x, y: oBL.y + TH }])}
        fill="#8898a8"
      />
      <polygon
        points={pStr([oTR, oBR, { x: oBR.x, y: oBR.y + TH }, { x: oTR.x, y: oTR.y + TH }])}
        fill="#7888a0"
      />
      {/* Side edge lines */}
      <line x1={oBL.x} y1={oBL.y + TH} x2={oBR.x} y2={oBR.y + TH}
        stroke="#6878888" strokeWidth={1} />
      <line x1={oTR.x} y1={oTR.y + TH} x2={oBR.x} y2={oBR.y + TH}
        stroke="#68788" strokeWidth={1} />

      {/* Tile border top face */}
      <polygon points={pStr([oTL, oTR, oBR, oBL])} fill="#c6cdd6" />
      {groutLines}
      {/* Board perimeter line */}
      <polygon points={pStr([oTL, oTR, oBR, oBL])} fill="none"
        stroke="#a8b2bc" strokeWidth={1} />

      {/* Green lawn via pattern + clip */}
      <rect width={W} height={H} fill="url(#hm-grass)" clipPath="url(#hm-lawn-clip)" />
      {/* Lawn inner shadow (tile border casts shadow on lawn edge) */}
      <polygon points={lawnPts} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={4} />
      <polygon points={lawnPts} fill="none" stroke="#3a6028" strokeWidth={1} />

      {/* Path edges */}
      {level.edges.map((edge, i) => {
        const f = nodeMap.get(edge.from), t = nodeMap.get(edge.to);
        if (!f || !t) return null;
        const fp = iso(f.x, f.y), tp = iso(t.x, t.y);
        return (
          <line key={i}
            x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
            stroke="#111" strokeWidth={1.6} strokeLinecap="round" />
        );
      })}

      {/* Enemy facing arrows */}
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
        const mx = fp.x + dx * 0.53, my = fp.y + dy * 0.53;
        const s = 8, w = 5;
        return (
          <polygon key={enemy.id + '-a'}
            points={`${mx + ux*s},${my + uy*s} ${mx - ux*s - uy*w},${my - uy*s + ux*w} ${mx - ux*s + uy*w},${my - uy*s - ux*w}`}
            fill={enemy.type === 'sniper' ? '#cc2020' : '#cc1818'}
            opacity={enemy.type === 'sniper' ? 1 : 0.9}
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
        const canClick = isAdj || isPlayer;

        return (
          <g key={node.id}>
            {/* Wait ring */}
            {isPlayer && state.status === 'playing' && (
              <circle cx={p.x} cy={p.y} r={16}
                fill="none" stroke="#4a70d0" strokeWidth={1.2}
                strokeDasharray="3 3.5" opacity={0.6} />
            )}

            {/* Move highlight */}
            {isAdj && (
              <circle cx={p.x} cy={p.y} r={14}
                fill="rgba(210,185,60,0.18)"
                stroke="#c8a030" strokeWidth={1.5}
                filter="url(#hm-move)"
              />
            )}

            {/* Node disc — small, inset in board */}
            {isExit ? (
              <g filter="url(#hm-exit)">
                <circle cx={p.x} cy={p.y} r={8}
                  fill="none" stroke="#00c060" strokeWidth={2.5}>
                  <animate attributeName="r"     values="7;11;7"   dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.2;1" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx={p.x} cy={p.y} r={3.5} fill="#00c060" />
              </g>
            ) : (
              <>
                {/* Inset disc shadow */}
                <circle cx={p.x + 0.5} cy={p.y + 1.5} r={6}
                  fill="rgba(0,0,0,0.25)" />
                <circle cx={p.x} cy={p.y} r={5.5}
                  fill={isPlayer && !enemy ? '#1e2e50' : '#1a1a1a'}
                  stroke={isPlayer && !enemy ? '#4a70d0' : '#333'}
                  strokeWidth={1}
                />
                {/* Node specular */}
                <ellipse cx={p.x - 1.5} cy={p.y - 1.5} rx={2} ry={1.2}
                  fill="rgba(255,255,255,0.1)" />
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
                  : <GuardPiece   x={p.x} y={p.y - 8} />
                }
              </g>
            )}

            {/* Click target */}
            {canClick && (
              <circle cx={p.x} cy={p.y} r={22}
                fill="transparent"
                onClick={() => onMove(node.id)}
                style={{ cursor: 'pointer' }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
