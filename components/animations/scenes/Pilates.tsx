"use client";

import { Easing, useLoopClock } from "../engine";
import { Figure } from "../Figure";
import { poseAt, standingSkel, type Pose } from "../rig";
import { SceneCaption } from "../SceneCaption";
import { SceneFrame } from "../SceneFrame";

const FILL = "#e9f0f5"; // cool-white
const BG = "#131414"; // midnight-soft
const ACCENT = "#de1f26"; // crimson

const P = {
  lieBack: { t: 172, th: 6, sh: 8, th2: 9, sh2: 11, u: 150, f: 165, u2: 155, f2: 170 },
  midCurl: { t: 140, th: 4, sh: 4, th2: 6, sh2: 6, u: 60, f: 40, u2: 65, f2: 45 },
  seatedFold: { t: -68, th: 2, sh: 0, th2: 4, sh2: 2, u: 8, f: -12, u2: 12, f2: -8 },
} satisfies Record<string, Pose>;

// Roll-up: reclined → curled seated fold → held stretch → back down. First/last pose match for a seamless loop.
const KF: Array<[number, Pose]> = [
  [0, P.lieBack],
  [1.3, P.midCurl],
  [2.6, P.seatedFold],
  [3.3, P.seatedFold],
  [4.6, P.midCurl],
  [6.0, P.lieBack],
];
const DURATION = 6.0;

export function PilatesScene() {
  const { ref, T } = useLoopClock<SVGSVGElement>(DURATION);
  const s = standingSkel(poseAt(T, KF, Easing.easeInOutSine));

  return (
    <SceneFrame ref={ref}>
      <rect x="30" y="250" width="340" height="140" rx="8" fill={ACCENT} opacity="0.06" />
      <g transform="translate(150,300) scale(0.85)">
        <Figure s={s} fill={FILL} bg={BG} />
      </g>
      <SceneCaption text="Pilates" T={T} duration={DURATION} />
    </SceneFrame>
  );
}
