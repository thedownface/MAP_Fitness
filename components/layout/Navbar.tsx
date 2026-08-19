"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { MobileMenu } from "./MobileMenu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-map",
          scrolled || menuOpen ? "bg-midnight/95 backdrop-blur-sm" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
          <Link href="/" className="z-50" data-cursor="link" aria-label="MAP Fitness home">
            <Image src="/images/map-logo-mark.png" alt="MAP" width={230} height={143} className="h-7 w-auto sm:h-8" priority />
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-cursor="link"
                  className={cn(
                    "font-display text-sm uppercase tracking-[0.15em] transition-colors",
                    active ? "text-crimson" : "text-cool-white hover:text-crimson",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/contact"
            data-cursor="link"
            className="hidden font-display text-sm uppercase tracking-[0.15em] text-crimson md:block"
          >
            Join Now →
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
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

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
