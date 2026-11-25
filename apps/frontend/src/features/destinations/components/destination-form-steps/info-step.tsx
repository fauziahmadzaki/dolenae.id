import { Input } from "~/components/ui/input";
import { Field, textareaClass } from "../form-field";
import type { StepProps } from "./types";

export function InfoStep({ values, errors, set }: StepProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Nama destinasi" htmlFor="name" error={errors.name}>
          <Input
            id="name"
            placeholder="mis. Gunung Bromo"
            aria-invalid={!!errors.name}
            value={values.name}
            onChange={(event) => set("name", event.target.value)}
          />
        </Field>
      </div>
      <Field
        label="Slug"
        htmlFor="slug"
        optional
        hint="Kosongkan untuk dibuat otomatis dari nama."
        error={errors.slug}
      >
        <Input
          id="slug"
          placeholder="gunung-bromo"
          aria-invalid={!!errors.slug}
          value={values.slug}
          onChange={(event) => set("slug", event.target.value)}
        />
      </Field>
      <Field label="Tagline" htmlFor="tagline" optional error={errors.tagline}>
        <Input
          id="tagline"
          placeholder="Satu kalimat yang menggambarkan destinasi"
          value={values.tagline}
          onChange={(event) => set("tagline", event.target.value)}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field
          label="Deskripsi"
          htmlFor="description"
          optional
          error={errors.description}
        >
          <textarea
            id="description"
            rows={6}
            className={textareaClass}
            placeholder="Ceritakan lanskap, pengalaman, dan hal khas destinasi ini."
            value={values.description}
            onChange={(event) => set("description", event.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}
