"use client";

import { Easing, useLoopClock } from "../engine";
import { Figure } from "../Figure";
import { poseAt, skel, type Pose } from "../rig";
import { SceneCaption } from "../SceneCaption";
import { SceneFrame } from "../SceneFrame";

const FILL = "#e9f0f5"; // cool-white
const BG = "#131414"; // midnight-soft
const ACCENT = "#de1f26"; // crimson

// Both hands stay together on the bar the whole rep (unlike the rig's default
// far-limb offset, tuned for a walking/fighting gait where the two sides
// naturally split) — every pose here gives the far arm its own near-identical
// angles so it reads as a slightly-offset second arm on the same bar instead
// of the default +188° opposite-side mirror, which pointed it back up past
// the head and rendered as a stray triangular flap.
const P = {
  hang: { f: 90, u: 90, t: 91, th: 94, sh: 89, u2: 84, f2: 84 },
  hangSwing: { f: 92, u: 88, t: 84, th: 74, sh: 84, u2: 82, f2: 86 },
  pullTop: { f: 140, u: 40, t: 88, th: 106, sh: 58, u2: 34, f2: 132 },
  trans: { f: -100, u: 70, t: 60, th: 10, sh: -15, u2: 64, f2: -108 },
  // f/u used to point almost dead-straight up (-95/-85), stacking both arm
  // segments into one near-vertical line that put the shoulder ~108 units
  // above the bar — enough to push the head off the top of the frame at the
  // held peak of the rep. Splitting the two segments across more of an angle
  // keeps the "arms locked" reading (each segment still points mostly
  // upward) while roughly halving how high the shoulder — and head — end up.
  lockout: { f: -150, u: -30, t: 90, th: 91, sh: 90, u2: -144, f2: -36 },
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
