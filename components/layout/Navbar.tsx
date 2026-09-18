"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MenuOverlay } from "./MenuOverlay";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { whatsappUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-transparent">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
          <Link href="/" className="z-50" data-cursor="link" aria-label="MAP Fitness home">
            <Image src="/images/map-logo-mark.png" alt="MAP" width={230} height={143} className="h-7 w-auto sm:h-8" priority />
          </Link>

          {/* Two controls on the right, and only two. The menu opens the
              same MenuOverlay at every breakpoint — no separate desktop
              link row competing for space with the hero's own right-hand
              content — and WhatsApp sits beside it because "message us" is
              the one action worth reaching without opening anything first.

              It stays put while the overlay is open: the header is z-50 and
              the overlay z-40, so this row renders over it, and the label
              beside it changes to Close rather than the row changing shape. */}
          <div className="z-50 flex items-center gap-1 sm:gap-3">
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="link"
              aria-label="Message MAP on WhatsApp"
              className="flex h-10 w-10 items-center justify-center text-cool-white transition-colors duration-300 hover:text-crimson"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              data-cursor="link"
              className="flex items-center gap-3"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span className="font-display text-sm uppercase tracking-[0.15em] text-cool-white">
                {menuOpen ? "Close" : "Menu"}
              </span>
              <span className="flex h-10 w-10 flex-col items-center justify-center gap-1.5">
                <span
                  className={cn(
                    "h-[2px] w-6 bg-cool-white transition-transform duration-300",
                    menuOpen && "translate-y-[7px] rotate-45 bg-crimson",
                  )}
                />
                <span
                  className={cn(
                    "h-[2px] w-6 bg-cool-white transition-transform duration-300",
                    menuOpen && "-translate-y-[7px] -rotate-45 bg-crimson",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
