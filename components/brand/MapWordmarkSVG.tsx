import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type MapWordmarkSVGProps = {
  className?: string;
  strokeWidth?: number;
  /** When set, paths render with dash-draw-on ready state (dashoffset 1, needs external animation). */
  animated?: boolean;
};

/**
 * Hand-built geometric wordmark standing in for the MAP logo: hard mitred
 * strokes for M and P (rigidity), a soft arched crossbar for A (range) —
 * the brand's own "rigidity vs range" story rendered directly in the mark.
 * Each letter is a single continuous path with pathLength=1 so a parent can
 * drive stroke-dashoffset for a draw-on reveal without measuring path length.
 * Forwards its ref to the root <svg> so a parent can also animate `color`
 * directly (every path strokes with currentColor).
 */
export const MapWordmarkSVG = forwardRef<SVGSVGElement, MapWordmarkSVGProps>(function MapWordmarkSVG(
  { className, strokeWidth = 22, animated = false },
  ref,
) {
  const pathClass = animated ? "map-draw" : undefined;

  return (
    <svg
      ref={ref}
      viewBox="-20 -20 640 280"
      fill="none"
      className={cn("text-crimson", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="MAP"
      role="img"
    >
      {/* M — sharp mitred strokes */}
      <path
        d="M10,220 L10,20 L100,190 L190,20 L190,220"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="miter"
        strokeLinecap="butt"
        pathLength={1}
        className={pathClass}
      />
      {/* A — straight legs, soft arched crossbar (the flexibility) */}
      <path
        d="M230,220 L230,90 Q310,20 390,90 L390,220"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="butt"
        pathLength={1}
        className={pathClass}
      />
      <path
        d="M255,150 L365,150"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.72}
        strokeLinecap="butt"
        pathLength={1}
        className={pathClass}
      />
      {/* P — sharp stem, rounded bowl */}
      <path
        d="M430,220 L430,20 L500,20 Q560,20 560,75 Q560,130 500,130 L430,130"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="miter"
        strokeLinecap="butt"
        pathLength={1}
        className={pathClass}
      />
    </svg>
  );
});
