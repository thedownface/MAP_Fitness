import { limb, type Skeleton } from "./rig";

/** Renders one rig pose as stacked limb polygons — far side dimmer, near side and head on top. */
export function Figure({ s, fill, bg }: { s: Skeleton; fill: string; bg: string }) {
  const far = { fill, opacity: 0.34, stroke: bg, strokeWidth: 2.5 };
  const near = { fill, stroke: bg, strokeWidth: 3 };
  return (
    <g strokeLinejoin="miter">
      <polygon points={limb(s.shoulder, s.elbow2, 26, 20)} {...far} />
      <polygon points={limb(s.elbow2, s.hand2, 19, 13)} {...far} />
      <polygon points={limb(s.hip, s.knee2, 30, 22)} {...far} />
      <polygon points={limb(s.knee2, s.foot2, 21, 12)} {...far} />
      <polygon points={limb(s.neck, s.head, 40, 24)} fill={fill} />
      <polygon points={limb(s.shoulder, s.hip, 50, 36)} {...near} />
      <polygon points={limb(s.hip, s.knee, 32, 23)} {...near} />
      <polygon points={limb(s.knee, s.foot, 22, 12)} {...near} />
      <polygon points={limb(s.shoulder, s.elbow, 27, 20)} {...near} />
      <polygon points={limb(s.elbow, s.hand, 20, 13)} {...near} />
      <circle cx={s.head[0]} cy={s.head[1]} r={21} fill={fill} stroke={bg} strokeWidth={3} />
    </g>
  );
}
