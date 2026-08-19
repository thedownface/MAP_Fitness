"use client";

import { useLoopClock } from "../engine";
import { SceneCaption } from "../SceneCaption";
import { SceneFrame } from "../SceneFrame";

const FILL = "#e9f0f5"; // cool-white
const ACCENT = "#de1f26"; // crimson
const DURATION = 5;

/** Abstract line-drawing loop — a barbell draws on, holds loaded, then draws off. */
export function EquipmentScene() {
  const { ref, T } = useLoopClock<SVGSVGElement>(DURATION);
  const u = T / DURATION;
  const progress = u < 0.4 ? u / 0.4 : u < 0.75 ? 1 : 1 - (u - 0.75) / 0.25;
  const pulse = 0.5 + 0.5 * Math.sin(u * Math.PI * 2 * 3);

  return (
    <SceneFrame ref={ref}>
      <g transform="translate(60,250)" stroke={FILL} strokeWidth="6" strokeLinecap="round" fill="none">
        <line
          x1="0"
          y1="0"
          x2="280"
          y2="0"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: 1 - progress }}
        />
      </g>
      <g transform="translate(60,250)">
        {[0, 280].map((x) => (
          <g key={x} transform={`translate(${x},0)`} opacity={progress}>
            <rect x={-8} y={-46} width="16" height="92" rx="3" fill={ACCENT} opacity={0.9} />
            <rect x={-14} y={-32} width="10" height="64" rx="2" fill={FILL} opacity={0.85} />
          </g>
        ))}
      </g>
      <circle cx="200" cy="250" r={10 + pulse * 4} fill={ACCENT} opacity={0.15 + pulse * 0.15} />
      <SceneCaption text="Equipment" T={T} duration={DURATION} />
    </SceneFrame>
  );
}
