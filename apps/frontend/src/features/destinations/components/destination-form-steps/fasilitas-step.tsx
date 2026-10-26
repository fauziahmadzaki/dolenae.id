import { Input } from "~/components/ui/input";
import { Field } from "../form-field";
import type { StepProps } from "./types";

export function FasilitasStep({ values, errors, set }: StepProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field
          label="Fasilitas umum"
          htmlFor="facilities"
          optional
          hint="Pisahkan dengan koma. Contoh: Toilet, Warung, Mushola, Parkir."
          error={errors.facilities}
        >
          <Input
            id="facilities"
            placeholder="Toilet, Warung, Mushola, Parkir"
            value={values.facilities}
            onChange={(event) => set("facilities", event.target.value)}
          />
        </Field>
      </div>
      <Field
        label="Biaya masuk (Rp)"
        htmlFor="entryFee"
        optional
        error={errors.entryFee}
      >
        <Input
          id="entryFee"
          inputMode="numeric"
          placeholder="29000"
          value={values.entryFee}
          onChange={(event) => set("entryFee", event.target.value)}
        />
      </Field>
      <div className="rounded-lg bg-canvas-subtle p-3 text-xs text-body sm:col-span-2">
        Fasilitas sekitar terverifikasi (penginapan, transportasi, makanan)
        dikelola pada modul Fasilitas. Di sini cukup fasilitas umum yang melekat
        pada destinasi.
      </div>
    </div>
  );
}
