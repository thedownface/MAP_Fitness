This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Hero frame sequence

The home page hero (`components/ui/equipment-hero-section.tsx`) scrubs a
frame sequence on a `<canvas>` as you scroll. It loads from `public/hero/`,
which is **generated** — do not edit it by hand:

```bash
npm run hero:frames    # scripts/encode-hero-frames.mjs
```

| Path | Role |
|---|---|
| `public/athlete/` | Masters. 479 PNGs, 1280×720, ~226 MB. Read-only input, never served. |
| `public/hero/desktop/` | 240 WebP frames, 1280×720, ~5.7 MB. |
| `public/hero/mobile/` | 120 WebP frames, 528×487, ~1.4 MB. Pre-cropped to the athlete. |
| `public/hero/*/manifest.json` | Frame count, dimensions, ground line, and (mobile) per-frame backdrop colours. Imported directly by the component. |

Two things about this are deliberate and easy to undo by accident:

**Mobile is a different crop, not a smaller copy.** A phone viewport is
portrait and the plate is 16:9, so cover-fitting the full frame showed only
its centre ~26% of width and cut the legs off the run and dive poses. The
mobile frames are pre-cropped to the window the athlete actually occupies
(measured: his silhouette across the whole sequence spans x∈[328,1024], and
he stands at x≈636 for most of it), and the renderer contains them to the
canvas width and fills the surround with each frame's own sampled backdrop
red rather than cropping further.

**The mobile diagonal is load-bearing, and four numbers decide it.** Mobile
splits the screen on a diagonal — black above, the red plate below — as the
portrait answer to the desktop wedge. The canvas is clipped along that line,
so the athlete has to stay under it: if he crosses, the clip shears the rim
light off his shoulders. The crop (`encode-hero-frames.mjs`) plus
`MOBILE_DIAGONAL_LEFT` / `MOBILE_DIAGONAL_RIGHT` / `MOBILE_FEET_Y` /
`MOBILE_MAX_HEIGHT` (`equipment-hero-section.tsx`) together determine
whether that holds, and the component hands the diagonal to the stylesheet
as CSS custom properties so the angle is written once. After changing any of
them:

```bash
node scripts/verify-hero-diagonal.mjs
```

It measures every published frame against every common viewport and fails if
the clip touches him. Note `MOBILE_MAX_HEIGHT` caps his size against
viewport *height* while the band is otherwise sized off *width* — that cap
is what keeps short 16:9 phones safe, and it is why he renders smaller
there than on a modern 19.5:9 screen.

**Frame counts are capped by decode cost, not by smoothness.** The hero
scrubs over a 360vh spacer — about 3040px on a phone — so 120 frames is
already one frame per 25px, faster than the display can resolve at any real
scroll speed. Raising the count costs bandwidth and decoded-bitmap memory
for frames that are never painted; the 479 masters worked out to one frame
per 6.3px, of which a normal flick would need ~400fps to show.
