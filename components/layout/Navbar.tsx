"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MenuOverlay } from "./MenuOverlay";
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

          {/* One control on the right now. The menu opens the same
              MenuOverlay at every breakpoint — no separate desktop link row
              competing for space with the hero's own right-hand content —
              and WhatsApp has moved out to its own fixed button in the
              bottom-right corner (WhatsAppFab, mounted in the root layout),
              where a persistent call to action belongs.

              It stays put while the overlay is open: the header is z-50 and
              the overlay z-40, so this renders over it. Open and closed are
              told apart by the bars crossing into an X and turning crimson,
              which is the same information the dropped "Menu"/"Close" label
              was carrying — aria-label and aria-expanded still say it for
              anyone not looking at the shape. */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            data-cursor="link"
            className="z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
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
          </button>
        </div>
      </header>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
