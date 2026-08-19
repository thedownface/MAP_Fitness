import localFont from "next/font/local";

// Self-hosted (not next/font/google) — avoids a Google Fonts network
// round-trip at build/dev time and keeps the site fully self-contained.
//
// Stand-ins for the MAP Brand Guidelines 2026 typefaces (Restore Black /
// Forma DJR Micro are licensed foundry fonts, not redistributable here):
// Archivo Black matches Restore Black's structure — sharp rectangular
// terminals, a straight-diagonal-leg R, a true circular O — closer than
// rounder display faces. Inter mirrors Forma DJR Micro's neutral,
// straight-leg-R humanist grotesque for body copy.
export const displayFont = localFont({
  src: "../public/fonts/ArchivoBlack-Regular.woff2",
  weight: "400",
  variable: "--font-archivo",
  display: "swap",
});

export const bodyFont = localFont({
  src: "../public/fonts/Inter-Variable.woff2",
  weight: "400 800",
  variable: "--font-inter",
  display: "swap",
});
