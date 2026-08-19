"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { SectionTag } from "./SectionTag";

type PhotoTileProps = {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  index?: string;
  className?: string;
  aspect?: string;
  priority?: boolean;
  href?: string;
};

export function PhotoTile({
  src,
  alt,
  title,
  description,
  index,
  className,
  aspect = "aspect-[4/5]",
  priority = false,
  href,
}: PhotoTileProps) {
  const imageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Ken-burns: a slow, continuously self-playing drift so the background
  // reads as animated the instant the card is on screen — independent of
  // scroll position and of the hover scale bump below.
  useEffect(() => {
    const image = imageRef.current;
    if (!image || reducedMotion) return;

    gsap.set(image, { scale: 1.08 });
    const tween = gsap.to(image, {
      scale: 1.18,
      duration: 9,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    return () => {
      tween.kill();
    };
  }, [reducedMotion]);

  const classes = cn("duotone group relative block overflow-hidden rounded-sharp", aspect, className);
  const content = (
    <>
      <div ref={imageRef} className="absolute inset-0 h-full w-full">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-map group-hover:scale-105"
        />
      </div>
      {index && (
        <div className="absolute right-4 top-4 z-10">
          <SectionTag index={index} />
        </div>
      )}
      {(title || description) && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1 p-6">
          {title && (
            <h3 className="font-display text-xl uppercase tracking-wide text-cool-white sm:text-2xl">
              {title}
            </h3>
          )}
          {description && <p className="text-sm text-cool-grey">{description}</p>}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} data-cursor="link">
        {content}
      </Link>
    );
  }
  return <div className={classes}>{content}</div>;
}
