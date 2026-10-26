import type { DestinationForm } from "../../schema";

export type FormErrors = Partial<Record<keyof DestinationForm, string>>;

export type SetField = <K extends keyof DestinationForm>(
  key: K,
  value: DestinationForm[K],
) => void;

/** Props yang diterima setiap langkah form destinasi. */
export interface StepProps {
  values: DestinationForm;
  errors: FormErrors;
  set: SetField;
}
