"use client";

import { Easing, useLoopClock } from "../engine";
import { Figure } from "../Figure";
import { poseAt, skel, type Pose } from "../rig";
import { SceneCaption } from "../SceneCaption";
import { SceneFrame } from "../SceneFrame";

const FILL = "#e9f0f5"; // cool-white
const BG = "#131414"; // midnight-soft
const ACCENT = "#de1f26"; // crimson

const P = {
  hang: { f: 90, u: 90, t: 91, th: 94, sh: 89 },
  hangSwing: { f: 92, u: 88, t: 84, th: 74, sh: 84 },
  pullTop: { f: 140, u: 40, t: 88, th: 106, sh: 58 },
  trans: { f: -100, u: 70, t: 60, th: 35, sh: 18 },
  lockout: { f: -95, u: -85, t: 90, th: 91, sh: 90 },
} satisfies Record<string, Pose>;

// A muscle-up rep, forward then back down — first and last pose match, so the loop is seamless.
const KF: Array<[number, Pose]> = [
  [0, P.hang],
  [0.5, P.hangSwing],
  [1.1, P.pullTop],
  [1.6, P.trans],
  [2.1, P.lockout],
  [2.7, P.lockout],
  [3.3, P.trans],
  [3.8, P.pullTop],
  [4.3, P.hangSwing],
  [4.8, P.hang],
];
const DURATION = 4.8;

export function CalisthenicsScene() {
  const { ref, T } = useLoopClock<SVGSVGElement>(DURATION);
  const s = skel(poseAt(T, KF, Easing.easeInOutCubic));

  return (
    <SceneFrame ref={ref}>
      <rect x="60" y="90" width="280" height="10" fill={BG} stroke={ACCENT} strokeWidth="2" opacity="0.5" />
      <g transform="translate(200,110) scale(0.82)">
        <circle cx="0" cy="0" r="6" fill={ACCENT} />
        <Figure s={s} fill={FILL} bg={BG} />
      </g>
      <SceneCaption text="Calisthenics" T={T} duration={DURATION} />
    </SceneFrame>
  );
}
