import type { HTMLAttributes, ReactNode } from "react";
import "./Card.css";

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Card heading. */
  title?: ReactNode;
  /** Heading level for the title, to fit the page outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Content rendered under the body, usually actions. */
  footer?: ReactNode;
  children?: ReactNode;
}

/**
 * Groups related content on a raised surface. Cards are static containers, so there
 * is no React Aria primitive here; put interactive elements (buttons, links) inside it.
 */
export function Card({ title, headingLevel = 3, footer, children, className, ...props }: CardProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article {...props} className={["ds-card", className].filter(Boolean).join(" ")}>
      {title && <Heading className="ds-card__title">{title}</Heading>}
      {children && <div className="ds-card__body">{children}</div>}
      {footer && <div className="ds-card__footer">{footer}</div>}
    </article>
  );
}
