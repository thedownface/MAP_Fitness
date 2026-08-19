import type { EaseFn } from "./engine";

/**
 * A 2-limb side-view humanoid rig, described entirely by joint angles
 * (degrees) off a single root. f/u = forearm/upper-arm, t = torso,
 * th/sh = thigh/shin. The *2 fields are the far-side limb (drawn dimmer,
 * behind the near side) — default to a fixed offset off the near limb
 * when omitted, same as the reference calisthenics rig.
 */
export type Pose = {
  f: number;
  u: number;
  t: number;
  th: number;
  sh: number;
  u2?: number;
  f2?: number;
  th2?: number;
  sh2?: number;
};

export type NormPose = Required<Pose>;

const rad = (a: number) => (a * Math.PI) / 180;
const d = (a: number, l: number): [number, number] => [Math.cos(rad(a)) * l, Math.sin(rad(a)) * l];
const add = (p: [number, number], v: [number, number]): [number, number] => [p[0] + v[0], p[1] + v[1]];

export function norm(p: Pose): NormPose {
  return {
    f: p.f,
    u: p.u,
    t: p.t,
    th: p.th,
    sh: p.sh,
    u2: p.u2 ?? p.u + 188,
    f2: p.f2 ?? p.f + 188,
    th2: p.th2 ?? p.th + 7,
    sh2: p.sh2 ?? p.sh + 7,
  };
}

const KEYS = ["f", "u", "t", "th", "sh", "u2", "f2", "th2", "sh2"] as const;

export function lerpPose(a: Pose, b: Pose, k: number): NormPose {
  const A = norm(a);
  const B = norm(b);
  const o = {} as NormPose;
  for (const key of KEYS) o[key] = A[key] + (B[key] - A[key]) * k;
  return o;
}

export const LIMB = { F: 52, U: 56, TT: 100, TH: 72, SH: 68 };
export type LimbLengths = typeof LIMB;

export type Skeleton = {
  hand: [number, number];
  elbow: [number, number];
  shoulder: [number, number];
  hip: [number, number];
  knee: [number, number];
  foot: [number, number];
  elbow2: [number, number];
  hand2: [number, number];
  knee2: [number, number];
  foot2: [number, number];
  head: [number, number];
  neck: [number, number];
};

/** Hand-rooted rig — origin is the gripping hand (bar work: hangs, pulls, presses). */
export function skel(p: NormPose, L: LimbLengths = LIMB): Skeleton {
  const hand: [number, number] = [0, 0];
  const elbow = add(hand, d(p.f, L.F));
  const shoulder = add(elbow, d(p.u, L.U));
  const hip = add(shoulder, d(p.t, L.TT));
  const knee = add(hip, d(p.th, L.TH));
  const foot = add(knee, d(p.sh, L.SH));
  const elbow2 = add(shoulder, d(p.u2, L.U));
  const hand2 = add(elbow2, d(p.f2, L.F));
  const knee2 = add(hip, d(p.th2, L.TH));
  const foot2 = add(knee2, d(p.sh2, L.SH));
  const head = add(shoulder, d(p.t + 180, 40));
  const neck = add(shoulder, d(p.t + 180, 8));
  return { hand, elbow, shoulder, hip, knee, foot, elbow2, hand2, knee2, foot2, head, neck };
}

/** Hip-rooted rig — origin is the standing/seated hip (ground-based disciplines). */
export function standingSkel(p: NormPose, L: LimbLengths = LIMB): Skeleton {
  const hip: [number, number] = [0, 0];
  const shoulder = add(hip, d(p.t, L.TT));
  const neck = add(shoulder, d(p.t, 8));
  const head = add(shoulder, d(p.t, 40));
  const elbow = add(shoulder, d(p.u, L.U));
  const hand = add(elbow, d(p.f, L.F));
  const elbow2 = add(shoulder, d(p.u2, L.U));
  const hand2 = add(elbow2, d(p.f2, L.F));
  const knee = add(hip, d(p.th, L.TH));
  const foot = add(knee, d(p.sh, L.SH));
  const knee2 = add(hip, d(p.th2, L.TH));
  const foot2 = add(knee2, d(p.sh2, L.SH));
  return { hand, elbow, shoulder, hip, knee, foot, elbow2, hand2, knee2, foot2, head, neck };
}

export function limb(p1: [number, number], p2: [number, number], w1: number, w2: number) {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l;
  const ny = dx / l;
  return [
    [p1[0] + (nx * w1) / 2, p1[1] + (ny * w1) / 2],
    [p2[0] + (nx * w2) / 2, p2[1] + (ny * w2) / 2],
    [p2[0] - (nx * w2) / 2, p2[1] - (ny * w2) / 2],
    [p1[0] - (nx * w1) / 2, p1[1] - (ny * w1) / 2],
  ]
    .map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`)
    .join(" ");
}

/** Piecewise pose interpolation across authored-second keyframes (looping-friendly: make kf[0] and kf[last] the same pose). */
export function poseAt(t: number, kf: Array<[number, Pose]>, ease: EaseFn): NormPose {
  const clamped = Math.min(Math.max(t, kf[0][0]), kf[kf.length - 1][0]);
  for (let i = kf.length - 2; i >= 0; i--) {
    if (clamped >= kf[i][0]) {
      const span = kf[i + 1][0] - kf[i][0];
      const k = span <= 0 ? 1 : ease(Math.min(Math.max((clamped - kf[i][0]) / span, 0), 1));
      return lerpPose(kf[i][1], kf[i + 1][1], k);
    }
  }
  return norm(kf[0][1]);
}
