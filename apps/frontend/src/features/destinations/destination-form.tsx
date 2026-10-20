"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { get, patch, post } from "~/lib/api/client";
import { ApiError } from "~/lib/api/types";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { cn } from "~/lib/cn";
import type { Category, DestinationDetail } from "~/types/domain";
import { CategoryIcon } from "./category-icon";
import {
  difficultyLabels,
  difficultyOptions,
  destinationFormSchema,
  emptyDestinationForm,
  statusLabels,
  statusOptions,
  toDestinationForm,
  toDestinationPayload,
  type DestinationForm,
} from "./schema";

const STEPS = [
  { key: "info", label: "Info Dasar" },
  { key: "klasifikasi", label: "Klasifikasi" },
  { key: "lokasi", label: "Lokasi & Akses" },
  { key: "fasilitas", label: "Fasilitas & Biaya" },
  { key: "media", label: "Media & Publikasi" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const stepFields: Record<StepKey, (keyof DestinationForm)[]> = {
  info: ["name", "slug", "tagline", "description"],
  klasifikasi: [
    "categoryIds",
    "difficulty",
    "terrain",
    "activities",
    "bestSeason",
    "tags",
    "elevationMeters",
    "guideRequired",
  ],
  lokasi: [
    "province",
    "regency",
    "district",
    "latitude",
    "longitude",
    "accessPoint",
    "accessDescription",
    "accessTransport",
    "accessDuration",
    "accessDistanceKm",
  ],
  fasilitas: ["facilities", "entryFee"],
  media: ["images", "status"],
};

const message = (error: unknown) =>
  error instanceof Error ? error.message : "Permintaan gagal. Silakan coba lagi.";

function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  optional,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  optional?: boolean;
}) {
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

const textareaClass =
  "w-full rounded-lg border border-hairline bg-canvas-subtle px-3.5 py-2.5 text-sm text-ink placeholder:text-body focus-visible:border-border-strong focus-visible:outline-none";

export function DestinationForm({
  destinationId,
}: {
  destinationId?: string;
}) {
  const auth = useAuth();
  const router = useRouter();
  const cache = useQueryClient();
  const editing = Boolean(destinationId);

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<DestinationForm>(emptyDestinationForm);
  const [errors, setErrors] = useState<Partial<Record<keyof DestinationForm, string>>>({});
  const [imageDraft, setImageDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [loaded, setLoaded] = useState(!editing);

  const enabled = auth.hydrated && !!auth.token && auth.user?.role === "admin";

  const categories = useQuery({
    queryKey: ["categories", "all"],
    queryFn: ({ signal }) =>
      get<Category[]>("/categories?limit=100&sort=name", { signal }),
    enabled,
    retry: false,
  });

  const detail = useQuery({
    queryKey: ["destination", destinationId],
    queryFn: ({ signal }) =>
      get<DestinationDetail>(`/destinations/${destinationId}`, { signal }),
    enabled: enabled && editing,
    retry: false,
  });

  useEffect(() => {
    if (auth.hydrated && !auth.token) router.replace("/auth/login");
  }, [auth.hydrated, auth.token, router]);

  useEffect(() => {
    if (!detail.data || loaded) return;
    setValues(toDestinationForm(detail.data.data));
    setLoaded(true);
  }, [detail.data, loaded]);

  const set = <K extends keyof DestinationForm>(key: K, value: DestinationForm[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const mutation = useMutation({
    mutationFn: (form: DestinationForm) => {
      const payload = toDestinationPayload(form);
      return editing
        ? patch(`/destinations/${destinationId}`, payload, {
            token: auth.token ?? undefined,
          })
        : post("/destinations", payload, { token: auth.token ?? undefined });
    },
    onSuccess: () => {
      cache.invalidateQueries({ queryKey: ["destinations"] });
      cache.invalidateQueries({ queryKey: ["destination", destinationId] });
      router.push("/admin/destinasi");
    },
  });

  useEffect(() => {
    const error = mutation.error ?? detail.error;
    if (error instanceof ApiError && error.status === 401) {
      auth.logout();
      router.replace("/auth/login");
    }
  }, [mutation.error, detail.error, auth.logout, router]);

  const issueFields = () => {
    const parsed = destinationFormSchema.safeParse(values);
    return parsed.success
      ? new Set<keyof DestinationForm>()
      : new Set(parsed.error.issues.map((issue) => issue.path[0] as keyof DestinationForm));
  };

  /** Validate the whole form, or only the fields of the current step. */
  const validate = (keys?: (keyof DestinationForm)[]) => {
    const parsed = destinationFormSchema.safeParse(values);
    if (parsed.success) {
      setErrors({});
      return parsed.data;
    }
    const nextErrors: Partial<Record<keyof DestinationForm, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof DestinationForm;
      if (!keys || keys.includes(key)) nextErrors[key] ??= issue.message;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return null;
    }
    // Errors exist, but only in other steps — let the user move on.
    return values;
  };

  const next = () => {
    const key = STEPS[step]!.key;
    if (validate(stepFields[key])) setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const submit = () => {
    const parsed = validate();
    if (!parsed) {
      const invalid = issueFields();
      const firstInvalid = STEPS.findIndex((entry) =>
        stepFields[entry.key].some((field) => invalid.has(field)),
      );
      if (firstInvalid >= 0) setStep(firstInvalid);
      return;
    }
    mutation.mutate(parsed);
  };

  const categoryList = categories.data?.data ?? [];
  const selectedCount = useMemo(
    () => categoryList.filter((c) => values.categoryIds.includes(c.id)).length,
    [categoryList, values.categoryIds],
  );

  if (!auth.hydrated || !auth.token) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-body">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        Memeriksa sesi…
      </p>
    );
  }

  if (auth.user?.role !== "admin") {
    return (
      <div className="rounded-xl border border-hairline bg-surface p-8">
        <h2 className="font-display text-xl font-bold text-ink">Akses ditolak</h2>
        <p className="mt-1 text-sm text-body">Halaman ini hanya untuk admin.</p>
      </div>
    );
  }

  if (editing && (detail.isPending || !loaded)) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-body">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        Memuat destinasi…
      </p>
    );
  }

  if (editing && detail.isError) {
    return (
      <div role="alert" className="rounded-xl border border-hairline bg-surface p-6">
        <p className="text-sm text-danger">{message(detail.error)}</p>
        <Button variant="secondary" className="mt-3" onClick={() => router.push("/admin/destinasi")}>
          Kembali ke daftar
        </Button>
      </div>
    );
  }

  const currentKey = STEPS[step]!.key;

  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/destinasi")}
            aria-label="Kembali ke daftar destinasi"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-surface text-body hover:bg-surface-2 hover:text-ink"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
          </button>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              {editing ? "Edit destinasi" : "Tambah destinasi"}
            </h2>
            <p className="text-sm text-body">
              Lengkapi 5 langkah, lalu publikasikan destinasi.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-body">
          Langkah {step + 1} dari {STEPS.length}
        </span>
      </div>

      {/* Step indicator */}
      <ol className="flex flex-wrap items-center gap-2" aria-label="Langkah formulir">
        {STEPS.map((entry, index) => (
          <li key={entry.key} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(index)}
              aria-current={index === step ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-xs font-semibold transition-colors",
                index === step
                  ? "bg-primary text-on-primary"
                  : index < step
                    ? "bg-success/10 text-success"
                    : "bg-surface-2 text-body",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px]",
                  index === step
                    ? "bg-on-primary/15"
                    : index < step
                      ? "bg-success text-white"
                      : "bg-surface text-body",
                )}
              >
                {index < step ? <Check aria-hidden className="h-3.5 w-3.5" /> : index + 1}
              </span>
              {entry.label}
            </button>
          </li>
        ))}
      </ol>

      {(mutation.isError || notice) && (
        <p
          role={mutation.isError ? "alert" : "status"}
          className={cn(
            "text-sm font-medium",
            mutation.isError ? "text-danger" : "text-success",
          )}
        >
          {mutation.isError ? message(mutation.error) : notice}
        </p>
      )}

      <div className="rounded-xl border border-hairline bg-surface p-6">
        {currentKey === "info" && (
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
              <Field label="Deskripsi" htmlFor="description" optional error={errors.description}>
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
        )}

        {currentKey === "klasifikasi" && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">
                Kategori <span className="font-normal text-body">({selectedCount} dipilih)</span>
              </p>
              {categories.isPending ? (
                <p className="text-sm text-body">Memuat kategori…</p>
              ) : categoryList.length === 0 ? (
                <p className="text-sm text-body">
                  Belum ada kategori. Tambahkan kategori dari tab Kategori di halaman daftar.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categoryList.map((category) => {
                    const active = values.categoryIds.includes(category.id);
                    return (
                      <button
                        key={category.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          set(
                            "categoryIds",
                            active
                              ? values.categoryIds.filter((id) => id !== category.id)
                              : [...values.categoryIds, category.id],
                          )
                        }
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
                          active
                            ? "border-primary bg-primary text-on-primary"
                            : "border-hairline bg-surface text-body hover:bg-canvas-subtle",
                        )}
                      >
                        <CategoryIcon name={category.icon} className="h-3.5 w-3.5" />
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.categoryIds && (
                <p role="alert" className="mt-1 text-xs text-danger">
                  {errors.categoryIds}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Kesulitan" error={errors.difficulty}>
                <select
                  aria-label="Kesulitan"
                  value={values.difficulty}
                  onChange={(event) =>
                    set("difficulty", event.target.value as DestinationForm["difficulty"])
                  }
                  className="h-12 w-full rounded-lg border border-hairline bg-canvas-subtle px-3 text-sm text-ink"
                >
                  {difficultyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Ketinggian (mdpl)" htmlFor="elevationMeters" optional error={errors.elevationMeters}>
                <Input
                  id="elevationMeters"
                  inputMode="numeric"
                  placeholder="2329"
                  value={values.elevationMeters}
                  onChange={(event) => set("elevationMeters", event.target.value)}
                />
              </Field>
              <Field
                label="Terrain"
                htmlFor="terrain"
                optional
                hint="Pisahkan dengan koma."
                error={errors.terrain}
              >
                <Input
                  id="terrain"
                  placeholder="Gunung, Bukit"
                  value={values.terrain}
                  onChange={(event) => set("terrain", event.target.value)}
                />
              </Field>
              <Field
                label="Aktivitas"
                htmlFor="activities"
                optional
                hint="Pisahkan dengan koma."
                error={errors.activities}
              >
                <Input
                  id="activities"
                  placeholder="Hiking, Camping"
                  value={values.activities}
                  onChange={(event) => set("activities", event.target.value)}
                />
              </Field>
              <Field label="Musim terbaik" htmlFor="bestSeason" optional error={errors.bestSeason}>
                <Input
                  id="bestSeason"
                  placeholder="April – Oktober"
                  value={values.bestSeason}
                  onChange={(event) => set("bestSeason", event.target.value)}
                />
              </Field>
              <Field label="Tag" htmlFor="tags" optional error={errors.tags}>
                <Input
                  id="tags"
                  placeholder="sunrise, kawah"
                  value={values.tags}
                  onChange={(event) => set("tags", event.target.value)}
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={values.guideRequired}
                onChange={(event) => set("guideRequired", event.target.checked)}
                className="h-4 w-4 rounded border-border-strong text-primary focus-visible:ring-primary"
              />
              Wajib didampingi pemandu
            </label>
          </div>
        )}

        {currentKey === "lokasi" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Provinsi" htmlFor="province" error={errors.province}>
              <Input
                id="province"
                placeholder="Jawa Timur"
                value={values.province}
                onChange={(event) => set("province", event.target.value)}
              />
            </Field>
            <Field label="Kabupaten / kota" htmlFor="regency" error={errors.regency}>
              <Input
                id="regency"
                placeholder="Probolinggo"
                value={values.regency}
                onChange={(event) => set("regency", event.target.value)}
              />
            </Field>
            <Field label="Kecamatan" htmlFor="district" optional error={errors.district}>
              <Input
                id="district"
                placeholder="Sukapura"
                value={values.district}
                onChange={(event) => set("district", event.target.value)}
              />
            </Field>
            <Field label="Titik akses" htmlFor="accessPoint" optional error={errors.accessPoint}>
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
            <Field label="Longitude" htmlFor="longitude" optional error={errors.longitude}>
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
            <Field label="Estimasi waktu tempuh" htmlFor="accessDuration" optional error={errors.accessDuration}>
              <Input
                id="accessDuration"
                placeholder="≈ 4 jam dari Malang"
                value={values.accessDuration}
                onChange={(event) => set("accessDuration", event.target.value)}
              />
            </Field>
            <Field label="Jarak akses (km)" htmlFor="accessDistanceKm" optional error={errors.accessDistanceKm}>
              <Input
                id="accessDistanceKm"
                inputMode="decimal"
                placeholder="140"
                value={values.accessDistanceKm}
                onChange={(event) => set("accessDistanceKm", event.target.value)}
              />
            </Field>
            <div className="sm:col-span-2 flex items-start gap-2 rounded-lg bg-canvas-subtle p-3 text-xs text-body">
              <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                Peta pemilih titik akan tersedia saat integrasi Modul 5. Untuk sekarang,
                isi koordinat secara manual.
              </p>
            </div>
          </div>
        )}

        {currentKey === "fasilitas" && (
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
            <Field label="Biaya masuk (Rp)" htmlFor="entryFee" optional error={errors.entryFee}>
              <Input
                id="entryFee"
                inputMode="numeric"
                placeholder="29000"
                value={values.entryFee}
                onChange={(event) => set("entryFee", event.target.value)}
              />
            </Field>
            <div className="sm:col-span-2 rounded-lg bg-canvas-subtle p-3 text-xs text-body">
              Fasilitas sekitar terverifikasi (penginapan, transportasi, makanan) dikelola
              pada modul Fasilitas. Di sini cukup fasilitas umum yang melekat pada destinasi.
            </div>
          </div>
        )}

        {currentKey === "media" && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">
                Foto destinasi <span className="font-normal text-body">({values.images.length}/20)</span>
              </p>
              <div className="flex gap-2">
                <Input
                  aria-label="URL foto"
                  placeholder="https://cdn.dolenae.id/bromo.jpg"
                  value={imageDraft}
                  onChange={(event) => setImageDraft(event.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!imageDraft.trim() || values.images.length >= 20}
                  onClick={() => {
                    set("images", [...values.images, imageDraft.trim()]);
                    setImageDraft("");
                  }}
                >
                  <ImagePlus aria-hidden className="h-4 w-4" />
                  Tambah
                </Button>
              </div>
              <p className="mt-1 text-xs text-body">
                Tempel URL foto. Unggah berkas tersedia setelah integrasi penyimpanan media.
              </p>
              {values.images.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-3">
                  {values.images.map((image, index) => (
                    <li key={`${image}-${index}`} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={`Foto ${index + 1}`}
                        className="h-20 w-28 rounded-lg border border-hairline object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-on-primary">
                          Utama
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label={`Hapus foto ${index + 1}`}
                        onClick={() =>
                          set(
                            "images",
                            values.images.filter((_, position) => position !== index),
                          )
                        }
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white shadow-sm"
                      >
                        <Trash2 aria-hidden className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {errors.images && (
                <p role="alert" className="mt-1 text-xs text-danger">
                  {errors.images}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Status publikasi" error={errors.status}>
                <select
                  aria-label="Status publikasi"
                  value={values.status}
                  onChange={(event) =>
                    set("status", event.target.value as DestinationForm["status"])
                  }
                  className="h-12 w-full rounded-lg border border-hairline bg-canvas-subtle px-3 text-sm text-ink"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="rounded-lg bg-canvas-subtle p-3 text-xs text-body">
                <p className="font-semibold text-ink">Ringkasan</p>
                <p className="mt-1">
                  {values.name || "Destinasi tanpa nama"} ·{" "}
                  {difficultyLabels[values.difficulty]} ·{" "}
                  {statusLabels[values.status]}
                </p>
                <p>
                  {values.province || "Provinsi belum diisi"}
                  {values.regency ? `, ${values.regency}` : ""}
                </p>
                <p>{values.categoryIds.length} kategori · {values.images.length} foto</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          disabled={step === 0 || mutation.isPending}
          onClick={() => setStep((current) => Math.max(current - 1, 0))}
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Kembali
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            disabled={mutation.isPending}
            onClick={() => {
              set("status", "draft");
              const parsed = destinationFormSchema.safeParse({ ...values, status: "draft" });
              if (!parsed.success) {
                setNotice("Lengkapi field wajib sebelum menyimpan draf.");
                return;
              }
              mutation.mutate(parsed.data);
            }}
          >
            Simpan draf
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>
              Lanjut
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
              {editing ? "Simpan perubahan" : "Publikasikan destinasi"}
            </Button>
          )}
        </div>
      </div>

      <p className="flex items-center gap-1 text-xs text-body">
        <Plus aria-hidden className="h-3 w-3" />
        Field bertanda opsional boleh dikosongkan; data dapat dilengkapi nanti.
      </p>
    </div>
  );
}
