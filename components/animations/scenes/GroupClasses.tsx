"use client";

import { useLoopClock } from "../engine";
import { SceneCaption } from "../SceneCaption";
import { SceneFrame } from "../SceneFrame";

const FILL = "#e9f0f5"; // cool-white
const ACCENT = "#de1f26"; // crimson
const DURATION = 2.2;

const PEOPLE = [
  { x: 90, scale: 0.78, opacity: 0.5, phase: 0.0, accent: false },
  { x: 160, scale: 0.95, opacity: 0.85, phase: 0.35, accent: false },
  { x: 230, scale: 1.05, opacity: 1, phase: 0.15, accent: true },
  { x: 300, scale: 0.9, opacity: 0.8, phase: 0.55, accent: false },
  { x: 355, scale: 0.72, opacity: 0.45, phase: 0.75, accent: false },
];

function Person({ cx, baseY, scale, opacity, fill }: { cx: number; baseY: number; scale: number; opacity: number; fill: string }) {
  const w = 34 * scale;
  const h = 58 * scale;
  const headR = 12 * scale;
  return (
    <g opacity={opacity}>
      <circle cx={cx} cy={baseY - h - headR} r={headR} fill={fill} />
      <rect x={cx - w / 2} y={baseY - h} width={w} height={h} rx={w * 0.35} fill={fill} />
    </g>
  );
}

/** Abstract crowd loop — simplified silhouettes hopping in staggered sync. */
export function GroupClassesScene() {
  const { ref, T } = useLoopClock<SVGSVGElement>(DURATION);
  const groundY = 420;

  return (
    <SceneFrame ref={ref}>
      <line x1="30" y1={groundY} x2="370" y2={groundY} stroke={ACCENT} strokeWidth="2" opacity="0.25" />
      {PEOPLE.map((p, i) => {
        const local = (T / DURATION + p.phase) % 1;
        const hop = Math.max(0, Math.sin(local * Math.PI * 2)) ** 2;
        const lift = hop * 34 * p.scale;
        return (
          <Person
            key={i}
            cx={p.x}
            baseY={groundY - lift}
            scale={p.scale}
            opacity={p.opacity}
            fill={p.accent ? ACCENT : FILL}
          />
        );
      })}
      <SceneCaption text="Group Classes" T={T} duration={DURATION} />
    </SceneFrame>
  );
}
