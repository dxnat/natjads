import type { ReactNode } from "react";
import {
  OverlayArrow,
  Tooltip as AriaTooltip,
  TooltipTrigger,
  composeRenderProps,
  type TooltipProps as AriaTooltipProps,
  type TooltipTriggerComponentProps,
} from "react-aria-components";
import "./Tooltip.css";

export { TooltipTrigger };
export type TooltipTriggerProps = TooltipTriggerComponentProps;

export interface TooltipProps extends Omit<AriaTooltipProps, "children"> {
  /** Tooltip text. Keep it short and non-essential; it is not reachable on touch. */
  children: ReactNode;
  /** Show the pointer arrow. */
  showArrow?: boolean;
}

/**
 * Short description shown on hover or keyboard focus. Built on React Aria `Tooltip`,
 * which handles warm-up/cool-down delays, Escape to dismiss, viewport-aware placement
 * and linking the description to the trigger. Place it inside a `TooltipTrigger`
 * after a focusable element such as `Button`.
 */
export function Tooltip({ children, showArrow = true, offset = 8, className, ...props }: TooltipProps) {
  return (
    <AriaTooltip
      {...props}
      offset={offset}
      className={composeRenderProps(className, (cls) => ["ds-tooltip", cls].filter(Boolean).join(" "))}
    >
      {showArrow && (
        <OverlayArrow className="ds-tooltip__arrow">
          <svg width={10} height={6} viewBox="0 0 10 6" aria-hidden="true">
            <path d="M0 0 L5 6 L10 0 Z" />
          </svg>
        </OverlayArrow>
      )}
      {children}
    </AriaTooltip>
  );
}
