import { MapPin } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Field, textareaClass } from "../form-field";
import type { StepProps } from "./types";

export function LokasiStep({ values, errors, set }: StepProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Provinsi" htmlFor="province" error={errors.province}>
        <Input
          id="province"
          placeholder="Jawa Timur"
          value={values.province}
          onChange={(event) => set("province", event.target.value)}
        />
      </Field>
      <Field
        label="Kabupaten / kota"
        htmlFor="regency"
        error={errors.regency}
      >
        <Input
          id="regency"
          placeholder="Probolinggo"
          value={values.regency}
          onChange={(event) => set("regency", event.target.value)}
        />
      </Field>
      <Field
        label="Kecamatan"
        htmlFor="district"
        optional
        error={errors.district}
      >
        <Input
          id="district"
          placeholder="Sukapura"
          value={values.district}
          onChange={(event) => set("district", event.target.value)}
        />
      </Field>
      <Field
        label="Titik akses"
        htmlFor="accessPoint"
        optional
        error={errors.accessPoint}
      >
        <Input
          id="accessPoint"
          placeholder="Cemoro Lawang"
          value={values.accessPoint}
          onChange={(event) => set("accessPoint", event.target.value)}
        />
      </Field>
      <Field label="Latitude" htmlFor="latitude" optional error={errors.latitude}>
        <Input
          id="latitude"
          inputMode="decimal"
          placeholder="-7.9425"
          value={values.latitude}
          onChange={(event) => set("latitude", event.target.value)}
        />
      </Field>
      <Field
        label="Longitude"
        htmlFor="longitude"
        optional
        error={errors.longitude}
      >
        <Input
          id="longitude"
          inputMode="decimal"
          placeholder="112.9530"
          value={values.longitude}
          onChange={(event) => set("longitude", event.target.value)}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field
          label="Deskripsi akses"
          htmlFor="accessDescription"
          optional
          error={errors.accessDescription}
        >
          <textarea
            id="accessDescription"
            rows={4}
            className={textareaClass}
            placeholder="Rute jalan, kondisi kendaraan, dan tips menuju lokasi."
            value={values.accessDescription}
            onChange={(event) => set("accessDescription", event.target.value)}
          />
        </Field>
      </div>
      <Field
        label="Moda transportasi"
        htmlFor="accessTransport"
        optional
        hint="Pisahkan dengan koma."
        error={errors.accessTransport}
      >
        <Input
          id="accessTransport"
          placeholder="Mobil, Jeep, Motor"
          value={values.accessTransport}
          onChange={(event) => set("accessTransport", event.target.value)}
        />
      </Field>
      <Field
        label="Estimasi waktu tempuh"
        htmlFor="accessDuration"
        optional
        error={errors.accessDuration}
      >
        <Input
          id="accessDuration"
          placeholder="≈ 4 jam dari Malang"
          value={values.accessDuration}
          onChange={(event) => set("accessDuration", event.target.value)}
        />
      </Field>
      <Field
        label="Jarak akses (km)"
        htmlFor="accessDistanceKm"
        optional
        error={errors.accessDistanceKm}
      >
        <Input
          id="accessDistanceKm"
          inputMode="decimal"
          placeholder="140"
          value={values.accessDistanceKm}
          onChange={(event) => set("accessDistanceKm", event.target.value)}
        />
      </Field>
      <div className="flex items-start gap-2 rounded-lg bg-canvas-subtle p-3 text-xs text-body sm:col-span-2">
        <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          Peta pemilih titik akan tersedia saat integrasi Modul 5. Untuk
          sekarang, isi koordinat secara manual.
        </p>
      </div>
    </div>
  );
}
