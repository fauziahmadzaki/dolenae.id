"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  MapPin,
  Upload,
} from "lucide-react";
import { LocationPicker } from "~/components/map/location-picker";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { useToast } from "~/components/ui/toaster";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { destinationsApi } from "~/features/destinations/api/destinations";
import { uploadsApi } from "~/features/media/api";
import { cn } from "~/lib/cn";
import type { Destination } from "~/types/domain";
import {
  useFacilityDetail,
  useFacilityMutation,
} from "../hooks/use-facilities";
import {
  categoryOptions,
  emptyFacilityForm,
  facilityToForm,
  toNumberOrNull,
  type FacilityFormValues,
} from "../types";

const STEPS = [
  { key: "info", label: "Info usaha" },
  { key: "lokasi", label: "Lokasi" },
  { key: "kontak", label: "Harga & kontak" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const MAX_DISTANCE_KM = 20;

function distanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number {
  const radius = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Permintaan gagal. Silakan coba lagi.";

const fieldClass = "space-y-1.5";
const labelClass = "text-xs font-semibold text-body";
const textareaClass =
  "min-h-24 w-full rounded-lg border border-hairline bg-canvas-subtle px-3.5 py-3 text-sm text-ink focus-visible:border-border-strong focus-visible:outline-none";

interface FacilityFormPageProps {
  facilityId?: string;
  mode: "merchant" | "admin";
  basePath: string;
}

export function FacilityFormPage({
  facilityId,
  mode,
  basePath,
}: FacilityFormPageProps) {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const editing = Boolean(facilityId);

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FacilityFormValues>(emptyFacilityForm);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(!editing);
  const [dirty, setDirty] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const enabled = auth.hydrated && !!auth.token && auth.user?.role === mode;

  const detail = useFacilityDetail(
    facilityId ?? null,
    auth.token,
    enabled && editing,
  );

  useEffect(() => {
    if (!auth.token) return;
    let active = true;
    destinationsApi
      .list({ page: 1, limit: 100, status: "published" }, auth.token)
      .then((result) => {
        if (active) setDestinations(result.data);
      })
      .catch(() => {
        if (active) {
          toast({
            title: "Gagal memuat destinasi",
            description: "Coba muat ulang halaman.",
            variant: "danger",
          });
        }
      })
      .finally(() => {
        if (active) setDestinationsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [auth.token, toast]);

  useEffect(() => {
    if (!editing || !detail.data) return;
    setValues(facilityToForm(detail.data.data));
    setLoaded(true);
  }, [editing, detail.data]);

  useEffect(() => {
    if (auth.hydrated && !auth.token) router.replace("/auth/login");
  }, [auth.hydrated, auth.token, router]);

  const selectedDestination = useMemo(
    () => destinations.find((item) => item.id === values.destinationId),
    [destinations, values.destinationId],
  );

  const reference = useMemo(() => {
    const location = selectedDestination?.location;
    if (location?.latitude == null || location?.longitude == null) return null;
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      label: selectedDestination?.name ?? "Destinasi",
    };
  }, [selectedDestination]);

  const latitude = toNumberOrNull(values.latitude);
  const longitude = toNumberOrNull(values.longitude);
  const distance =
    reference && latitude != null && longitude != null
      ? distanceKm(reference, { latitude, longitude })
      : null;
  const withinGeofence = distance != null && distance <= MAX_DISTANCE_KM;

  const mutation = useFacilityMutation({
    token: auth.token ?? undefined,
    onSaved: (savedMessage) => {
      setDirty(false);
      toast({ title: savedMessage, variant: "success" });
      router.push(basePath);
    },
    onUnauthorized: () => {
      auth.logout();
      router.replace("/auth/login");
    },
    onError: (error) =>
      toast({ title: "Gagal menyimpan", description: message(error), variant: "danger" }),
  });

  const set = <K extends keyof FacilityFormValues>(
    key: K,
    value: FacilityFormValues[K],
  ) => {
    setDirty(true);
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const onDestinationChange = (destinationId: string) => {
    set("destinationId", destinationId);
    const destination = destinations.find((item) => item.id === destinationId);
    const location = destination?.location;
    if (location?.latitude != null && location?.longitude != null) {
      setValues((prev) => ({
        ...prev,
        destinationId,
        latitude: String(location.latitude),
        longitude: String(location.longitude),
      }));
    }
  };

  const uploadBanner = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadsApi.upload(file, auth.token, "facilities");
      set("bannerUrl", result.data.url);
    } catch (error) {
      toast({ title: "Upload gagal", description: message(error), variant: "danger" });
    } finally {
      setUploading(false);
    }
  };

  const validateStep = (key: StepKey): boolean => {
    if (key === "info") {
      if (!values.destinationId) {
        toast({ title: "Pilih destinasi terlebih dahulu", variant: "danger" });
        return false;
      }
      if (!values.name.trim()) {
        toast({ title: "Nama fasilitas wajib diisi", variant: "danger" });
        return false;
      }
      if (!values.type.trim()) {
        toast({ title: "Tipe fasilitas wajib diisi", variant: "danger" });
        return false;
      }
      return true;
    }
    if (key === "lokasi") {
      if (latitude == null || longitude == null) {
        toast({ title: "Tentukan lokasi di peta", variant: "danger" });
        return false;
      }
      if (!reference) {
        toast({
          title: "Destinasi belum punya koordinat",
          description: "Lengkapi lokasi destinasi terlebih dahulu.",
          variant: "danger",
        });
        return false;
      }
      if (!withinGeofence) {
        toast({
          title: "Lokasi terlalu jauh",
          description: `Maksimal ${MAX_DISTANCE_KM} km dari destinasi (saat ini ${distance?.toFixed(1)} km).`,
          variant: "danger",
        });
        return false;
      }
      return true;
    }
    if (!values.contact.trim()) {
      toast({ title: "Kontak wajib diisi", variant: "danger" });
      return false;
    }
    const priceMin = toNumberOrNull(values.priceMin);
    const priceMax = toNumberOrNull(values.priceMax);
    if (priceMax != null && priceMin == null) {
      toast({ title: "Harga termahal butuh harga mulai", variant: "danger" });
      return false;
    }
    if (priceMin != null && priceMax != null && priceMax < priceMin) {
      toast({
        title: "Harga termahal tidak boleh lebih kecil",
        variant: "danger",
      });
      return false;
    }
    return true;
  };

  const next = () => {
    const current = STEPS[step]!.key;
    if (!validateStep(current)) return;
    setStep((value) => Math.min(value + 1, STEPS.length - 1));
  };

  const submit = () => {
    for (const item of STEPS) {
      if (!validateStep(item.key)) {
        setStep(STEPS.findIndex((entry) => entry.key === item.key));
        return;
      }
    }

    const payload = {
      destinationId: values.destinationId,
      name: values.name.trim(),
      category: values.category,
      type: values.type.trim(),
      latitude: latitude!,
      longitude: longitude!,
      priceMin: toNumberOrNull(values.priceMin),
      priceMax: toNumberOrNull(values.priceMax),
      description: values.description.trim() || null,
      contact: values.contact.trim(),
      contactEmail: values.contactEmail.trim() || null,
      website: values.website.trim() || null,
      bannerUrl: values.bannerUrl.trim() || null,
    };

    mutation.mutate(
      editing && facilityId
        ? { kind: "edit", id: facilityId, payload }
        : { kind: "create", payload },
    );
  };

  const leave = () => {
    if (dirty) setConfirmLeave(true);
    else router.push(basePath);
  };

  if (!auth.hydrated || !auth.token) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-body">
        <Loader2 className="h-4 w-4 animate-spin" /> Memeriksa sesi…
      </p>
    );
  }

  if (auth.user?.role !== mode) {
    return (
      <div className="rounded-xl border border-hairline bg-surface p-8">
        <h2 className="font-display text-xl font-bold text-ink">Akses ditolak</h2>
        <p className="mt-1 text-sm text-body">
          Halaman ini hanya untuk {mode === "admin" ? "admin" : "merchant"}.
        </p>
      </div>
    );
  }

  if (editing && (detail.isPending || !loaded)) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-body">
        <Loader2 className="h-4 w-4 animate-spin" /> Memuat fasilitas…
      </p>
    );
  }

  if (editing && detail.isError) {
    return (
      <div role="alert" className="rounded-xl border border-hairline bg-surface p-6">
        <p className="text-sm text-danger">{message(detail.error)}</p>
        <Button variant="secondary" className="mt-3" onClick={() => router.push(basePath)}>
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
            onClick={leave}
            aria-label="Kembali ke daftar fasilitas"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-surface text-body hover:bg-surface-2 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              {editing ? "Edit fasilitas" : "Daftarkan fasilitas"}
            </h2>
            <p className="text-sm text-body">
              {mode === "merchant"
                ? "Fasilitas akan ditinjau admin sebelum tayang."
                : "Fasilitas yang dibuat admin langsung tayang."}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-body">
          Langkah {step + 1} dari {STEPS.length}
        </span>
      </div>

      <ol className="flex items-center gap-2">
        {STEPS.map((item, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <li key={item.key} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => index < step && setStep(index)}
                disabled={index > step}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  active
                    ? "bg-primary text-on-primary"
                    : done
                      ? "bg-primary/15 text-primary"
                      : "bg-canvas-subtle text-body",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </button>
              <span
                className={cn(
                  "hidden text-xs font-semibold sm:block",
                  active ? "text-ink" : "text-body",
                )}
              >
                {item.label}
              </span>
              {index < STEPS.length - 1 && (
                <span className="h-px flex-1 bg-hairline" />
              )}
            </li>
          );
        })}
      </ol>

      {currentKey === "info" && (
        <section className="space-y-4 rounded-xl border border-hairline bg-surface p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className={fieldClass}>
              <span className={labelClass}>Destinasi *</span>
              <Select
                options={destinations.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                value={values.destinationId}
                onChange={onDestinationChange}
                placeholder={destinationsLoading ? "Memuat…" : "Pilih destinasi"}
                disabled={destinationsLoading}
              />
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Kategori *</span>
              <Select
                options={categoryOptions}
                value={values.category}
                onChange={(value) =>
                  set("category", value as FacilityFormValues["category"])
                }
              />
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Nama fasilitas *</span>
              <Input
                value={values.name}
                onChange={(event) => set("name", event.target.value)}
                placeholder="Homestay Cemoro Indah"
              />
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Tipe *</span>
              <Input
                value={values.type}
                onChange={(event) => set("type", event.target.value)}
                placeholder="homestay / jeep / warung"
              />
            </label>
          </div>
          <label className={fieldClass}>
            <span className={labelClass}>Deskripsi</span>
            <textarea
              value={values.description}
              onChange={(event) => set("description", event.target.value)}
              className={textareaClass}
              placeholder="Ceritakan singkat fasilitas, keunggulan, dan aksesnya."
            />
          </label>
        </section>
      )}

      {currentKey === "lokasi" && (
        <section className="space-y-4 rounded-xl border border-hairline bg-surface p-5">
          {!selectedDestination ? (
            <p className="text-sm text-body">
              Pilih destinasi terlebih dahulu pada langkah sebelumnya.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-sm text-ink">
                  <MapPin className="h-4 w-4 text-primary" />
                  {selectedDestination.name}
                </p>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    distance == null
                      ? "bg-canvas-subtle text-body"
                      : withinGeofence
                        ? "bg-success/15 text-success"
                        : "bg-danger/10 text-danger",
                  )}
                >
                  {distance == null
                    ? "Titik belum dipilih"
                    : `${distance.toFixed(1)} km dari destinasi`}
                </span>
              </div>

              {!reference && (
                <p className="rounded-lg bg-danger/5 px-3 py-2 text-xs text-danger">
                  Destinasi ini belum memiliki koordinat. Lengkapi lokasi destinasi
                  terlebih dahulu.
                </p>
              )}

              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                reference={reference}
                radiusKm={MAX_DISTANCE_KM}
                hint={`Klik peta untuk menaruh fasilitas. Lingkaran = batas ${MAX_DISTANCE_KM} km dari destinasi.`}
                onChange={(lat, lng) => {
                  setValues((prev) => ({
                    ...prev,
                    latitude: lat.toFixed(6),
                    longitude: lng.toFixed(6),
                  }));
                  setDirty(true);
                }}
                onClear={() => {
                  set("latitude", "");
                  set("longitude", "");
                }}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <label className={fieldClass}>
                  <span className={labelClass}>Latitude</span>
                  <Input
                    value={values.latitude}
                    onChange={(event) => set("latitude", event.target.value)}
                    inputMode="decimal"
                  />
                </label>
                <label className={fieldClass}>
                  <span className={labelClass}>Longitude</span>
                  <Input
                    value={values.longitude}
                    onChange={(event) => set("longitude", event.target.value)}
                    inputMode="decimal"
                  />
                </label>
              </div>

              {distance != null && !withinGeofence && (
                <p className="text-xs text-danger">
                  Lokasi lebih dari {MAX_DISTANCE_KM} km dari destinasi. Geser pin
                  lebih dekat untuk melanjutkan.
                </p>
              )}
            </>
          )}
        </section>
      )}

      {currentKey === "kontak" && (
        <section className="space-y-4 rounded-xl border border-hairline bg-surface p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className={fieldClass}>
              <span className={labelClass}>Harga mulai (Rp)</span>
              <Input
                value={values.priceMin}
                onChange={(event) => set("priceMin", event.target.value)}
                inputMode="numeric"
                placeholder="150000"
              />
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Harga termahal (Rp)</span>
              <Input
                value={values.priceMax}
                onChange={(event) => set("priceMax", event.target.value)}
                inputMode="numeric"
                placeholder="300000"
              />
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Kontak *</span>
              <Input
                value={values.contact}
                onChange={(event) => set("contact", event.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Email</span>
              <Input
                type="email"
                value={values.contactEmail}
                onChange={(event) => set("contactEmail", event.target.value)}
                placeholder="halo@usahaku.id"
              />
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Website</span>
              <Input
                value={values.website}
                onChange={(event) => set("website", event.target.value)}
                placeholder="https://usahaku.id"
              />
            </label>
            <div className="space-y-1.5">
              <span className={labelClass}>Unggah banner</span>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border-strong bg-canvas-subtle px-3 py-3 text-sm text-body">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>
                  {uploading ? "Mengunggah…" : "Pilih gambar (JPEG/PNG/WebP)"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadBanner(file);
                  }}
                />
              </label>
            </div>
          </div>

          <label className={fieldClass}>
            <span className={labelClass}>Banner URL</span>
            <Input
              value={values.bannerUrl}
              onChange={(event) => set("bannerUrl", event.target.value)}
              placeholder="https://…"
            />
          </label>

          {values.bannerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={values.bannerUrl}
              alt="Pratinjau banner"
              className="h-40 w-full rounded-lg object-cover"
            />
          )}
        </section>
      )}

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="secondary"
          onClick={() => (step === 0 ? leave() : setStep((value) => value - 1))}
          disabled={mutation.isPending}
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 0 ? "Batal" : "Kembali"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>
            Lanjut <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={submit} disabled={mutation.isPending || uploading}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {editing ? "Simpan perubahan" : "Kirim pendaftaran"}
          </Button>
        )}
      </div>

      <Dialog open={confirmLeave} onOpenChange={(open) => !open && setConfirmLeave(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tinggalkan form?</DialogTitle>
            <DialogDescription>
              Perubahan yang belum disimpan akan hilang.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmLeave(false)}>
              Tetap di sini
            </Button>
            <Button onClick={() => router.push(basePath)}>Tinggalkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
