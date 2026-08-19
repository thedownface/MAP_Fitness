import Image from "next/image";
import Link from "next/link";
import { CONTACT, NAV_LINKS, BRAND } from "@/lib/constants";
import { MapSubmarkSVG } from "@/components/brand/MapSubmarkSVG";
import { DoubleRuleDivider } from "@/components/ui/DoubleRuleDivider";

export function Footer() {
  return (
    <footer className="bg-midnight">
      <DoubleRuleDivider />
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 py-16 sm:px-10 lg:flex-row lg:justify-between">
        <div className="flex flex-col gap-4">
          <Image src="/images/map-logo-mark.png" alt="MAP" width={230} height={143} className="h-10 w-auto" />
          <MapSubmarkSVG />
          <p className="mt-2 max-w-xs font-display text-sm uppercase tracking-[0.2em] text-cool-grey">
            {BRAND.tagline}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-xs uppercase tracking-[0.25em] text-crimson">Sitemap</h4>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-cool-grey transition-colors hover:text-cool-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-display text-xs uppercase tracking-[0.25em] text-crimson">Contact</h4>
            <ul className="flex flex-col gap-2">
              {CONTACT.phones.map((phone) => (
                <li key={phone.number}>
                  <a
                    href={`tel:${phone.number.replace(/\s/g, "")}`}
                    className="text-sm text-cool-grey transition-colors hover:text-cool-white"
                  >
                    {phone.label}: {phone.number}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={CONTACT.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cool-grey transition-colors hover:text-cool-white"
                >
                  {CONTACT.instagram}
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
            <h4 className="font-display text-xs uppercase tracking-[0.25em] text-crimson">Visit</h4>
            <address className="flex flex-col gap-0.5 text-sm not-italic text-cool-grey">
              {CONTACT.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          </div>
        </div>
      </div>

      <div className="border-t border-cool-grey/10 px-6 py-6 sm:px-10">
        <p className="text-xs text-cool-grey/60">
          © {new Date().getFullYear()} {BRAND.name} — {BRAND.fullName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
