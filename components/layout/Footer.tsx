"use client";

import Link from "next/link";
import { CONTACT, NAV_LINKS, BRAND } from "@/lib/constants";
import { MapSubmarkSVG } from "@/components/brand/MapSubmarkSVG";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="bg-midnight">
      <Marquee text={BRAND.campaignLine} />

      <div className="mx-auto max-w-7xl px-6 pt-16 sm:px-10 lg:pt-24">
        <Reveal className="grid gap-16 border-b border-cool-grey/10 pb-16 lg:grid-cols-[1.3fr_1fr] lg:gap-8 lg:pb-20">
          <div className="flex flex-col gap-8">
            <h2 className="font-display text-5xl uppercase leading-[0.92] text-cool-white sm:text-7xl">
              {BRAND.tagline}
            </h2>
            <Button href="/contact" variant="sharp" className="w-fit">
              Begin Your Story →
            </Button>
          </div>

          <nav className="flex flex-col">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                data-cursor="link"
                className={cn(
                  "group flex items-baseline justify-between border-cool-grey/10 py-4",
                  i > 0 && "border-t",
                )}
              >
                <span className="flex items-baseline gap-4">
                  <span className="font-display text-xs text-crimson">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-2xl uppercase tracking-wide text-cool-white transition-colors group-hover:text-crimson sm:text-3xl">
                    {link.label}
                  </span>
                </span>
                <span className="font-display text-xl text-cool-grey/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-crimson">
                  →
                </span>
              </Link>
            ))}
          </nav>
        </Reveal>

        <Reveal stagger className="grid grid-cols-1 gap-10 py-16 sm:grid-cols-3 lg:py-20">
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-xs uppercase tracking-[0.25em] text-crimson">Call</h4>
            <ul className="flex flex-col gap-1.5">
              {CONTACT.phones.map((phone) => (
                <li key={phone.number}>
                  <a
                    href={`tel:${phone.number.replace(/\s/g, "")}`}
                    data-cursor="link"
                    className="text-sm text-cool-grey transition-colors hover:text-cool-white"
                  >
                    <span className="text-cool-grey/50">{phone.label}</span> {phone.number}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-display text-xs uppercase tracking-[0.25em] text-crimson">Visit</h4>
            <address className="flex flex-col gap-0.5 text-sm not-italic text-cool-grey">
              {CONTACT.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-display text-xs uppercase tracking-[0.25em] text-crimson">Follow</h4>
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="link"
              className="w-fit text-sm text-cool-grey transition-colors hover:text-cool-white"
            >
              {CONTACT.instagram}
            </a>
          </div>
        </Reveal>
      </div>

      <div className="border-t border-cool-grey/10">
        <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-6 px-6 py-6 sm:flex-row sm:justify-between sm:px-10">
          <p className="text-xs text-cool-grey/60">
            © {new Date().getFullYear()} {BRAND.name} — {BRAND.fullName}. All rights reserved.
          </p>

          <MapSubmarkSVG className="opacity-40" />

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            data-cursor="link"
            className="group flex items-center gap-3 font-display text-xs uppercase tracking-[0.2em] text-cool-grey transition-colors hover:text-crimson"
          >
            Back to top
            <span className="flex h-7 w-7 items-center justify-center rounded-sharp border border-cool-grey/30 transition-colors group-hover:border-crimson group-hover:text-crimson">
              ↑
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
