import { clamp, Easing } from "./engine";

const FILL = "#e9f0f5"; // cool-white
const ACCENT = "#de1f26"; // crimson

// Cue points as a fraction of the scene's own loop duration, so the same
// beat (rule draws, word slides up, holds, fades) scales to a 1s sprint
// loop and a 6s pilates loop alike.
const RULE_END = 0.1;
const WORD_START = 0.05;
const WORD_END = 0.16;
const HOLD_UNTIL = 0.35;
const FADE_END = 0.45;

/** The reference teaser's per-move title card, replayed once per scene loop. */
export function SceneCaption({ text, T, duration }: { text: string; T: number; duration: number }) {
  const u = T / duration;
  const ruleK = Easing.easeOutCubic(clamp(u / RULE_END, 0, 1));
  const wordK = Easing.easeOutCubic(clamp((u - WORD_START) / (WORD_END - WORD_START), 0, 1));
  const fadeOut = u < HOLD_UNTIL ? 1 : 1 - clamp((u - HOLD_UNTIL) / (FADE_END - HOLD_UNTIL), 0, 1);
  const opacity = wordK * fadeOut;

  return (
    <g pointerEvents="none">
      <rect x="24" y="32" width={ruleK * 110} height="3" fill={ACCENT} opacity={ruleK * fadeOut} />
      <text
        x="24"
        y={64 + (1 - wordK) * 18}
        className="font-display uppercase"
        fontWeight={800}
        fontSize={28}
        letterSpacing="0.5"
        fill={FILL}
        opacity={opacity}
      >
        {text}
      </text>
    </g>
  );
}
