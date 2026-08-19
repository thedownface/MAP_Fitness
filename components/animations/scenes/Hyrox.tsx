"use client";

import { useLoopClock } from "../engine";
import { Figure } from "../Figure";
import { norm, standingSkel, type Pose } from "../rig";
import { SceneCaption } from "../SceneCaption";
import { SceneFrame } from "../SceneFrame";

const FILL = "#e9f0f5"; // cool-white
const BG = "#131414"; // midnight-soft
const ACCENT = "#de1f26"; // crimson
const STRIDE = 1.0; // one stride cycle per second — kept fast and separate from...
const DURATION = 4.0; // ...the loop clock, so the caption below doesn't replay every stride

// Procedural sprint gait (sinusoidal, not hand-keyed poses) — legs alternate
// a half-cycle apart, arms drive opposite the same-side leg.
function runningPose(phase: number): Pose {
  return {
    t: -92 + 3 * Math.sin(phase * 2),
    th: 45 + 85 * Math.sin(phase),
    sh: 95 - 55 * Math.sin(phase + 0.7),
    th2: 45 + 85 * Math.sin(phase + Math.PI),
    sh2: 95 - 55 * Math.sin(phase + Math.PI + 0.7),
    u: 95 - 55 * Math.sin(phase + Math.PI),
    f: 100 - 45 * Math.sin(phase + Math.PI + 0.5),
    u2: 95 - 55 * Math.sin(phase),
    f2: 100 - 45 * Math.sin(phase + 0.5),
  };
}

export function HyroxScene() {
  const { ref, T } = useLoopClock<SVGSVGElement>(DURATION);
  const phase = ((T % STRIDE) / STRIDE) * Math.PI * 2;
  const s = standingSkel(norm(runningPose(phase)));
  const bob = 6 * Math.abs(Math.sin(phase));

  return (
    <SceneFrame ref={ref}>
      <g stroke={ACCENT} strokeWidth="2" opacity="0.25" strokeDasharray="14 10">
        <line x1="20" y1="240" x2="140" y2="240" />
        <line x1="10" y1="300" x2="160" y2="300" />
        <line x1="30" y1="360" x2="150" y2="360" />
      </g>
      <g transform={`translate(200,${(300 - bob).toFixed(1)}) scale(0.82)`}>
        <Figure s={s} fill={FILL} bg={BG} />
      </g>
      <SceneCaption text="Hyrox" T={T} duration={DURATION} />
    </SceneFrame>
  );
}
