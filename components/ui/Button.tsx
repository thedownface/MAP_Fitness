import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type BaseProps = {
  variant?: "sharp" | "pill" | "ghost";
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = BaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "href"> & {
    href: string;
  };

type ButtonAsButton = BaseProps &
  Omit<ComponentPropsWithoutRef<"button">, "className"> & {
    href?: undefined;
  };

type ButtonProps = ButtonAsLink | ButtonAsButton;

const base =
  "group relative inline-flex items-center justify-center gap-2 font-display uppercase tracking-wide text-sm px-8 py-4 transition-all duration-300 ease-map cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

const variants = {
  sharp: "bg-crimson text-midnight rounded-sharp hover:bg-cool-white",
  pill: "bg-transparent text-cool-white rounded-pill border border-cool-grey/40 hover:border-crimson hover:text-crimson",
  ghost: "bg-transparent text-crimson rounded-sharp hover:bg-crimson hover:text-midnight",
};

export function Button({ variant = "sharp", className, children, ...props }: ButtonProps) {
  const classes = cn(base, variants[variant], className);

  if ("href" in props && props.href) {
    const { href, ...rest } = props as ButtonAsLink;
    return (
      <Link href={href} className={classes} data-cursor="link" {...rest}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button className={classes} data-cursor="link" {...buttonProps}>
      {children}
    </button>
  );
}
