import type { ReactNode } from "react";

export const textareaClass =
  "w-full rounded-lg border border-hairline bg-canvas-subtle px-3.5 py-2.5 text-sm text-ink placeholder:text-body focus-visible:border-border-strong focus-visible:outline-none";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  optional?: boolean;
}

/** Label + kontrol + hint/error untuk form destinasi. */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  optional,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
        {label}{" "}
        {optional && <span className="font-normal text-body">(opsional)</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-body">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
