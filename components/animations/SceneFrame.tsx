import { forwardRef, type ReactNode } from "react";

/** Shared canvas + modular-grid backdrop every discipline scene renders into, framed to match the site's brand grid motif. */
export const SceneFrame = forwardRef<SVGSVGElement, { children: ReactNode }>(function SceneFrame(
  { children },
  ref,
) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 400 500"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      className="block h-full w-full"
    >
      <rect x="0" y="0" width="400" height="500" className="fill-midnight-soft" />
      <g className="stroke-cool-grey/10" strokeWidth="1">
        <line x1="133" y1="0" x2="133" y2="500" />
        <line x1="267" y1="0" x2="267" y2="500" />
        <line x1="0" y1="167" x2="400" y2="167" />
        <line x1="0" y1="333" x2="400" y2="333" />
      </g>
      {children}
    </svg>
  );
});
