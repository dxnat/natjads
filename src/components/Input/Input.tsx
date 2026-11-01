import type { ReactNode } from "react";
import {
  FieldError,
  Input as AriaInput,
  Label,
  Text,
  TextField,
  composeRenderProps,
  type TextFieldProps,
  type ValidationResult,
} from "react-aria-components";
import "./Input.css";

export interface InputProps extends Omit<TextFieldProps, "children"> {
  /** Visible label. Required for accessibility unless `aria-label` is set. */
  label?: ReactNode;
  /** Helper text shown under the field. */
  description?: ReactNode;
  /** Error message, or a function that builds one from the validation result. */
  errorMessage?: ReactNode | ((validation: ValidationResult) => ReactNode);
  /** Placeholder text. Don't use it in place of a label. */
  placeholder?: string;
}

/**
 * Single-line text field. Built on React Aria `TextField`, which wires up the
 * label, description and error message to the input with the right ARIA attributes
 * and supports native and custom validation.
 */
export function Input({ label, description, errorMessage, placeholder, className, ...props }: InputProps) {
  return (
    <TextField
      {...props}
      className={composeRenderProps(className, (cls) => ["ds-field", cls].filter(Boolean).join(" "))}
    >
      {label && <Label className="ds-field__label">{label}</Label>}
      <AriaInput className="ds-input" placeholder={placeholder} />
      {description && (
        <Text slot="description" className="ds-field__description">
          {description}
        </Text>
      )}
      <FieldError className="ds-field__error">{errorMessage}</FieldError>
    </TextField>
  );
}
