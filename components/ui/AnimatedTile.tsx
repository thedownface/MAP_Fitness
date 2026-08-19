import Link from "next/link";
import { cn } from "@/lib/utils";
import { SectionTag } from "./SectionTag";

type AnimatedTileProps = {
  title?: string;
  description?: string;
  index?: string;
  className?: string;
  aspect?: string;
  href?: string;
  children: React.ReactNode;
};

/** PhotoTile's chrome (index badge, title/description overlay) around a live scene instead of a photo. Wraps in a Link when `href` is given. */
export function AnimatedTile({
  title,
  description,
  index,
  className,
  aspect = "aspect-[4/5]",
  href,
  children,
}: AnimatedTileProps) {
  const classes = cn(
    "group relative block overflow-hidden rounded-sharp bg-midnight-soft transition-colors duration-300",
    href && "hover:ring-1 hover:ring-crimson/60",
    aspect,
    className,
  );
  const content = (
    <>
      {children}
      {index && (
        <div className="absolute right-4 top-4 z-10">
          <SectionTag index={index} />
        </div>
      )}
      {(title || description) && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1 bg-gradient-to-t from-midnight via-midnight/75 to-transparent p-6 pt-12">
          {title && (
            <h3 className="font-display text-xl uppercase tracking-wide text-cool-white sm:text-2xl">{title}</h3>
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
