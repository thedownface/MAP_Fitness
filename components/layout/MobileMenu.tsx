"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS, CONTACT } from "@/lib/constants";
import { MapWordmarkSVG } from "@/components/brand/MapWordmarkSVG";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-40 flex flex-col justify-between bg-midnight px-6 pb-10 pt-28"
        >
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link, i) => {
              const active = pathname === link.href;
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={`block border-b border-cool-grey/10 py-4 font-display text-4xl uppercase tracking-wide transition-colors ${
                      active ? "text-crimson" : "text-cool-white hover:text-crimson"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1 text-sm text-cool-grey">
              {CONTACT.phones.slice(0, 1).map((phone) => (
                <a key={phone.number} href={`tel:${phone.number.replace(/\s/g, "")}`} className="hover:text-crimson">
                  {phone.number}
                </a>
              ))}
              <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-crimson">
                {CONTACT.instagram}
              </a>
            </div>
            <MapWordmarkSVG className="h-8 w-auto opacity-40" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
