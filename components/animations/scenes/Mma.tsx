"use client";

import { Easing, useLoopClock } from "../engine";
import { Figure } from "../Figure";
import { poseAt, standingSkel, type Pose } from "../rig";
import { SceneCaption } from "../SceneCaption";
import { SceneFrame } from "../SceneFrame";

const FILL = "#e9f0f5"; // cool-white
const BG = "#131414"; // midnight-soft
const ACCENT = "#de1f26"; // crimson

const STANCE = { t: -84, th: 55, sh: 98, th2: 112, sh2: 84 };
const P = {
  guard: { ...STANCE, u: -12, f: 40, u2: -28, f2: 52 },
  jab: { ...STANCE, u: 6, f: 6, u2: -32, f2: 58 },
  cross: { ...STANCE, u: -22, f: 50, u2: 4, f2: 8 },
} satisfies Record<string, Pose>;

// Jab, jab, cross combo, resetting to guard between each — first/last pose match for a seamless loop.
const KF: Array<[number, Pose]> = [
  [0, P.guard],
  [0.32, P.jab],
  [0.55, P.guard],
  [0.75, P.jab],
  [1.05, P.guard],
  [1.45, P.cross],
  [1.7, P.guard],
  [2.1, P.cross],
  [2.4, P.guard],
];
const DURATION = 2.4;

export function MmaScene() {
  const { ref, T } = useLoopClock<SVGSVGElement>(DURATION);
  const s = standingSkel(poseAt(T, KF, Easing.easeOutQuad));

  return (
    <SceneFrame ref={ref}>
      <circle cx="290" cy="230" r="46" fill="none" stroke={ACCENT} strokeWidth="2" opacity="0.25" />
      <g transform="translate(190,320) scale(0.82)">
        <Figure s={s} fill={FILL} bg={BG} />
      </g>
      <SceneCaption text="MMA" T={T} duration={DURATION} />
    </SceneFrame>
  );
}
