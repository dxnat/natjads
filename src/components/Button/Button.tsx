import {
  Button as AriaButton,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends AriaButtonProps {
  /** Visual style. Maps to the `button/{variant}/*` component tokens. */
  variant?: ButtonVariant;
  /** Padding scale. Maps to `button/{size}/padding-x|y`. */
  size?: ButtonSize;
}

/**
 * Triggers an action. Built on React Aria `Button`, so it handles press events
 * across mouse, touch and keyboard, focus-visible rings, and disabled/pending states.
 */
export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <AriaButton
      {...props}
      data-variant={variant}
      data-size={size}
      className={composeRenderProps(className, (cls) => ["ds-button", cls].filter(Boolean).join(" "))}
    >
      {composeRenderProps(props.children, (children, { isPending }) => (
        <>
          {isPending && <span className="ds-button__spinner" aria-hidden="true" />}
          {children}
        </>
      ))}
    </AriaButton>
  );
}
