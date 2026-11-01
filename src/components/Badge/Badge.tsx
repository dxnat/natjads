import type { HTMLAttributes, ReactNode } from "react";
import "./Badge.css";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status colour. Maps to the `badge/{variant}/*` component tokens. */
  variant?: BadgeVariant;
  /** Optional leading icon. Mark decorative icons `aria-hidden`. */
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Short status label. Badges are static text, so there is no React Aria primitive
 * here. Colour alone shouldn't carry meaning; the label text must say the status.
 */
export function Badge({ variant = "neutral", icon, children, className, ...props }: BadgeProps) {
  return (
    <span {...props} data-variant={variant} className={["ds-badge", className].filter(Boolean).join(" ")}>
      {icon}
      {children}
    </span>
  );
}
