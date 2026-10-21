import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { LocationPicker } from "~/components/map/location-picker";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { regionsApi, type ReverseRegion } from "~/features/regions/api";
import {
  useDistricts,
  useProvinces,
  useRegencies,
} from "~/features/regions/hooks";
import { Field, textareaClass } from "../form-field";
import type { StepProps } from "./types";

const toCoordinate = (value: string): number | null => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toOptions = (rows: { name: string }[]) => [
  { value: "", label: "Belum dipilih" },
  ...rows.map((row) => ({ value: row.name, label: row.name })),
];

export function LokasiStep({ values, errors, set }: StepProps) {
  const provinces = useProvinces();
  const provinceList = provinces.data?.data ?? [];
  const provinceCode = provinceList.find(
    (province) => province.name === values.province,
  )?.code;

  const regencies = useRegencies(provinceCode);
  const regencyList = regencies.data?.data ?? [];
  const regencyCode = regencyList.find(
    (regency) => regency.name === values.regency,
  )?.code;

  const districts = useDistricts(regencyCode);
  const districtList = districts.data?.data ?? [];

  const provinceOptions = useMemo(() => toOptions(provinceList), [provinceList]);
  const regencyOptions = useMemo(() => toOptions(regencyList), [regencyList]);
  const districtOptions = useMemo(() => toOptions(districtList), [districtList]);

  const latitude = toCoordinate(values.latitude);
  const longitude = toCoordinate(values.longitude);

  const [detected, setDetected] = useState<ReverseRegion | null>(null);
  const [detecting, setDetecting] = useState(false);
  const lastKey = useRef("");

  // Approximate reverse geocode once the marker settles.
  useEffect(() => {
    if (latitude === null || longitude === null) {
      setDetected(null);
      return;
    }

    const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    if (lastKey.current === key) return;

    const timer = setTimeout(async () => {
      lastKey.current = key;
      setDetecting(true);
      try {
        const result = await regionsApi.reverse(latitude, longitude);
        setDetected(result.data);
      } catch {
        setDetected(null);
      } finally {
        setDetecting(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [latitude, longitude]);

  // Prefill only the empty region fields, so manual choices are never lost.
  useEffect(() => {
    if (!detected) return;
    if (!values.province) set("province", detected.province.name);
    if (!values.regency) set("regency", detected.regency.name);
    if (!values.district) set("district", detected.district.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detected]);

  const applyDetected = () => {
    if (!detected) return;
    set("province", detected.province.name);
    set("regency", detected.regency.name);
    set("district", detected.district.name);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-semibold text-ink">Titik destinasi</p>
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          onChange={(lat, lng) => {
            set("latitude", lat.toFixed(6));
            set("longitude", lng.toFixed(6));
          }}
          onClear={() => {
            set("latitude", "");
            set("longitude", "");
          }}
        />

        {detecting && (
          <p role="status" className="mt-2 text-xs text-body">
            Mencari wilayah dari titik peta…
          </p>
        )}

        {detected && !detecting && (
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-canvas-subtle p-3 text-xs text-body">
            <Sparkles aria-hidden className="h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              Perkiraan wilayah: <strong className="text-ink">{detected.district.name}</strong>,{" "}
              {detected.regency.name}, {detected.province.name} (±
              {detected.distanceKm} km dari titik).
            </span>
            <Button size="sm" variant="secondary" onClick={applyDetected}>
              Sesuaikan wilayah
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Provinsi" error={errors.province}>
          <Select
            ariaLabel="Provinsi"
            value={values.province}
            onChange={(name) => {
              set("province", name);
              set("regency", "");
              set("district", "");
            }}
            options={provinceOptions}
            placeholder={provinces.isPending ? "Memuat provinsi…" : "Pilih provinsi"}
            disabled={provinces.isPending || provinceList.length === 0}
          />
        </Field>
        <Field label="Kabupaten / kota" error={errors.regency}>
          <Select
            ariaLabel="Kabupaten atau kota"
            value={values.regency}
            onChange={(name) => {
              set("regency", name);
              set("district", "");
            }}
            options={regencyOptions}
            placeholder={
              !provinceCode
                ? "Pilih provinsi dulu"
                : regencies.isPending
                  ? "Memuat kabupaten…"
                  : "Pilih kabupaten/kota"
            }
            disabled={!provinceCode || regencies.isPending}
          />
        </Field>
        <Field label="Kecamatan" optional error={errors.district}>
          <Select
            ariaLabel="Kecamatan"
            value={values.district}
            onChange={(name) => set("district", name)}
            options={districtOptions}
            placeholder={
              !regencyCode
                ? "Pilih kabupaten dulu"
                : districts.isPending
                  ? "Memuat kecamatan…"
                  : "Pilih kecamatan"
            }
            disabled={!regencyCode || districts.isPending}
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

        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-semibold text-ink">Koordinat</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Latitude"
              htmlFor="latitude"
              optional
              error={errors.latitude}
            >
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
          </div>
          <p className="mt-1 text-xs text-body">
            Terisi otomatis dari peta; bisa diubah manual untuk presisi.
          </p>
        </div>

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
      </div>
    </div>
  );
}
