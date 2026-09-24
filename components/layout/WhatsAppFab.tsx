import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { whatsappUrl } from "@/lib/constants";

/** The site's one persistent call to action, parked bottom-right on every
 * page rather than riding in the navbar beside the menu.
 *
 * Filled crimson on midnight, matching the `sharp` Button variant, because
 * at this size and this much isolation it reads as the page's primary
 * action and should look like the other primary actions — where the navbar
 * version was an outline glyph sharing a row with the menu toggle. Still
 * not WhatsApp's green, for the reason WhatsAppIcon gives: it would be the
 * only fourth colour on the site.
 *
 * The white border is load-bearing, not decoration. This button sits over
 * the hero for most of the home page, and the hero's plate is a flat red
 * that crimson is only a shade away from — the fill and the background came
 * out at about 1.2:1 against each other, so the circle's edge vanished and
 * all that was left was a glyph apparently floating on the plate. The
 * border is the one thing on the button guaranteed to separate from red.
 *
 * z-30 puts it over page content (which tops out at z-10) but under
 * MenuOverlay's z-40, so opening the menu covers it. That is deliberate —
 * the overlay is opaque and carries its own contact block and wordmark in
 * exactly this corner, and a button floating over them would collide with
 * both. The preloader (z-[100]) hides it on load for the same reason.
 *
 * No safe-area inset: the app sets no `viewport-fit=cover`, so the layout
 * viewport already stops above the iOS home indicator and env() would
 * resolve to 0 anyway. */
export function WhatsAppFab() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="link"
      aria-label="Message MAP on WhatsApp"
      className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full border-2 border-cool-white bg-crimson text-midnight shadow-lg shadow-midnight/50 transition-colors duration-300 ease-map hover:bg-cool-white sm:bottom-8 sm:right-8"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
