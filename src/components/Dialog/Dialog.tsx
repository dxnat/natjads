import type { ReactNode } from "react";
import {
  Dialog as AriaDialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
  type DialogTriggerProps,
  type ModalOverlayProps,
} from "react-aria-components";
import "./Dialog.css";

export { DialogTrigger };
export type { DialogTriggerProps };

type RenderWithClose = (opts: { close: () => void }) => ReactNode;

export interface DialogProps extends Omit<ModalOverlayProps, "children" | "className" | "style"> {
  /** Dialog heading. Also used as the accessible name. */
  title: ReactNode;
  /** Body content, or a function that receives `close`. */
  children?: ReactNode | RenderWithClose;
  /** Action buttons in the footer, or a function that receives `close`. */
  actions?: ReactNode | RenderWithClose;
  /** Use `alertdialog` for destructive or interrupting confirmations. */
  role?: "dialog" | "alertdialog";
  /** Extra class on the dialog panel. */
  className?: string;
}

/**
 * Modal dialog. Built on React Aria `ModalOverlay`, `Modal` and `Dialog`, which
 * handle focus trapping and restoration, Escape to close, scroll locking and hiding
 * the rest of the page from screen readers. Place it inside a `DialogTrigger`
 * next to the button that opens it, or control it with `isOpen` / `onOpenChange`.
 */
export function Dialog({ title, children, actions, role = "dialog", className, isDismissable = true, ...overlayProps }: DialogProps) {
  return (
    <ModalOverlay {...overlayProps} isDismissable={role === "alertdialog" ? false : isDismissable} className="ds-dialog-overlay">
      <Modal className="ds-dialog-modal">
        <AriaDialog role={role} className={["ds-dialog", className].filter(Boolean).join(" ")}>
          {({ close }) => (
            <>
              <Heading slot="title" className="ds-dialog__title">
                {title}
              </Heading>
              {children && (
                <div className="ds-dialog__body">{typeof children === "function" ? children({ close }) : children}</div>
              )}
              {actions && (
                <div className="ds-dialog__actions">{typeof actions === "function" ? actions({ close }) : actions}</div>
              )}
            </>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
