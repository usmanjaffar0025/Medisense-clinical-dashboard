import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control border font-semibold leading-none whitespace-nowrap transition-colors duration-160 ease-out hover:no-underline disabled:cursor-not-allowed disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary:
    "border-accent bg-accent text-white hover:border-accent-hover hover:bg-accent-hover active:bg-accent-pressed",
  secondary: "border-border-strong bg-surface text-ink-900 hover:bg-canvas",
  ghost:
    "border-transparent bg-transparent text-accent hover:bg-accent-tint hover:text-accent-hover",
};

const sizes: Record<Size, Record<Variant, string>> = {
  md: {
    primary: "h-9 px-4 text-small",
    secondary: "h-9 px-3.5 text-small",
    ghost: "h-9 px-2.5 text-small",
  },
  sm: {
    primary: "h-7.5 px-2.5 text-caption",
    secondary: "h-7.5 px-2.5 text-caption",
    ghost: "h-7.5 px-2.5 text-caption",
  },
};

type StyleProps = { variant?: Variant; size?: Size };

export function buttonClasses({ variant = "secondary", size = "md" }: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size][variant]);
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & StyleProps) {
  return (
    <button type={type} className={cn(buttonClasses({ variant, size }), className)} {...props} />
  );
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={cn(buttonClasses({ variant, size }), className)} {...props} />;
}
