import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Category, Destination, TravelSupport } from "@dolenae/types";
import { useAuth } from "~/features/auth/auth-context";
import {
  createDestination,
  createSupport,
  deleteSupport,
  getDestinationBySlug,
  listCategories,
  listSupports,
  updateDestination,
  updateSupport,
} from "~/features/destinations/api";
import { apiFetch } from "~/lib/api";
import {
  listDistricts,
  listProvinces,
  listRegencies,
  reverseGeocode,
} from "~/features/regions/api";
import { MapView } from "~/components/map-view";
import { SearchableSelect } from "~/components/ui/searchable-select";
import { uploadImage, deleteUpload } from "~/features/uploads/api";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBed,
  IconBold,
  IconCar,
  IconCheck,
  IconCrosshair,
  IconFlag,
  IconFolderOpen,
  IconHeading1,
  IconHeading2,
  IconImage,
  IconInfo,
  IconItalic,
  IconLightbulb,
  IconLink,
  IconList,
  IconListOrdered,
  IconMapPin,
  IconPlus,
  IconQuote,
  IconRedo,
  IconRotateCcw,
  IconStrikethrough,
  IconTrash2,
  IconUnderline,
  IconUndo,
  IconUploadCloud,
  IconUtensils,
  IconX,
} from "~/components/icons";

const STEPS = ["Info Dasar", "Klasifikasi", "Lokasi & Akses", "Fasilitas", "Media"] as const;

const STEP_META: ({ title: string; text: string; icon: "lightbulb" | "info" | "camera" } | null)[] = [
  {
    icon: "lightbulb",
    title: "Tips menulis",
    text: "Gunakan deskripsi 2-3 paragraf: gambaran umum, daya tarik, dan informasi praktis. Manfaatkan heading dan daftar agar mudah dibaca.",
  },
  {
    icon: "info",
    title: "Klasifikasi",
    text: "Terrain dan aktivitas membantu wisatawan memfilter destinasi. Pilih yang paling relevan, maksimal 4 per kategori.",
  },
  null,
  {
    icon: "info",
    title: "Fasilitas",
    text: "Informasi fasilitas membantu wisatawan mempersiapkan perjalanan, khususnya ketersediaan air, toilet, dan warung.",
  },
  {
    icon: "camera",
    title: "Foto berkualitas",
    text: "Gunakan foto landscape minimal 1400px. Foto pertama jadi sampul kartu di katalog.",
  },
];

const DIFFICULTIES = [
  { value: "ramah-pemula", label: "Ramah pemula", dot: "bg-success" },
  { value: "menengah", label: "Menengah", dot: "bg-warning" },
  { value: "sulit", label: "Sulit", dot: "bg-danger" },
  { value: "butuh-lokal-guide", label: "Butuh lokal guide", dot: "bg-border-strong" },
] as const;

const TRANSPORT_MODES = ["mobil", "jeep", "motor", "elf", "open-trip", "kereta", "bus"] as const;

const SEASONS = ["Kering", "Hujan", "Mei-Sep", "Jul-Okt"] as const;

const FALLBACK_TERRAIN: [string, string][] = [
  ["gunung", "Gunung"],
  ["bukit", "Bukit"],
  ["danau", "Danau"],
  ["air-terjun", "Air terjun"],
  ["camping-ground", "Camping ground"],
  ["savana", "Savana"],
  ["hutan", "Hutan"],
  ["pantai", "Pantai"],
];

const FALLBACK_ACTIVITY: [string, string][] = [
  ["hiking", "Hiking"],
  ["camping", "Camping"],
  ["sightseeing", "Sightseeing"],
  ["photography", "Photography"],
  ["sunrise", "Sunrise"],
  ["susur-sungai", "Susur sungai"],
  ["off-road", "Off-road"],
];

type FormState = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  terrain: string[];
  activities: string[];
  difficulty: string;
  bestSeason: string[];
  elevationMeters: string;
  province: string;
  regency: string;
  district: string;
  latitude: string;
  longitude: string;
  basecampName: string;
  distanceKm: string;
  accessDescription: string;
  transportModes: string[];
  estimatedTravelTime: string;
  toilet: boolean;
  warung: boolean;
  mushola: boolean;
  parkingArea: boolean;
  homestayNearby: boolean;
  guideRequired: boolean;
  entryFee: string;
  status: "draft" | "published";
  images: string[];
  tags: string[];
  categoryIds: string[];
};

const EMPTY: FormState = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  terrain: [],
  activities: [],
  difficulty: "ramah-pemula",
  bestSeason: [],
  elevationMeters: "",
  province: "",
  regency: "",
  district: "",
  latitude: "",
  longitude: "",
  basecampName: "",
  distanceKm: "",
  accessDescription: "",
  transportModes: [],
  estimatedTravelTime: "",
  toilet: false,
  warung: false,
  mushola: false,
  parkingArea: false,
  homestayNearby: false,
  guideRequired: false,
  entryFee: "",
  status: "draft",
  images: [],
  tags: [],
  categoryIds: [],
};

export function DestinationFormScreen({ id }: Readonly<{ id: string }>) {
  const isNew = id === "new";
  const navigate = useNavigate();
  const { token } = useAuth();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [destId, setDestId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [regencies, setRegencies] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [supports, setSupports] = useState<TravelSupport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  const terrainCats = useMemo(() => categories.filter((c) => c.type === "terrain"), [categories]);
  const activityCats = useMemo(() => categories.filter((c) => c.type === "activity"), [categories]);
  const terrainOptions = terrainCats.length
    ? terrainCats.map((c) => [c.slug, c.name] as [string, string])
    : FALLBACK_TERRAIN;
  const activityOptions = activityCats.length
    ? activityCats.map((c) => [c.slug, c.name] as [string, string])
    : FALLBACK_ACTIVITY;

  useEffect(() => {
    void listCategories({}, token ?? undefined).then(setCategories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Data wilayah (nama saja): provinsi → kabupaten → kecamatan.
  useEffect(() => {
    void listProvinces().then(setProvinces).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!form.province) {
      setRegencies([]);
      return;
    }
    let active = true;
    void listRegencies(form.province)
      .then((r) => {
        if (active) setRegencies(r.map((x) => x.name));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [form.province]);

  useEffect(() => {
    if (!form.regency) {
      setDistricts([]);
      return;
    }
    let active = true;
    void listDistricts(form.regency, form.province || undefined)
      .then((r) => {
        if (active) setDistricts(r.map((x) => x.name));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [form.regency, form.province]);

  /** Isi provinsi/kabupaten/kecamatan dari koordinat (reverse geocode). */
  async function applyReverse(lat: number, lng: number, overwrite: boolean) {
    try {
      const res = await reverseGeocode(lat, lng);
      if (!res) return;
      setForm((f) => ({
        ...f,
        province: overwrite || !f.province ? res.province : f.province,
        regency: overwrite || !f.regency ? res.regency : f.regency,
        district: overwrite || !f.district ? res.district : f.district,
        elevationMeters:
          (overwrite || !f.elevationMeters) && res.elevation
            ? String(res.elevation)
            : f.elevationMeters,
      }));
    } catch {
      // abaikan: reverse geocode bersifat bantuan, bukan wajib
    }
  }

  // Bila koordinat diubah manual, isi area yang masih kosong (debounce).
  useEffect(() => {
    if (!coordsValid(form.latitude, form.longitude)) return;
    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    const t = setTimeout(() => {
      void applyReverse(lat, lng, false);
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.latitude, form.longitude]);

  useEffect(() => {
    if (isNew || !token) return;
    void (async () => {
      try {
        let dest: (Destination & { supports: TravelSupport[] }) | null = null;
        try {
          const r = await apiFetch<Destination & { supports: TravelSupport[] }>(
            `/destinations/${id}`,
            { token },
          );
          dest = r.data;
        } catch {
          dest = await getDestinationBySlug(id);
        }
        if (!dest) throw new Error("Destinasi tidak ditemukan");
        setDestId(dest.id);
        setForm({
          ...EMPTY,
          name: dest.name,
          slug: dest.slug,
          tagline: dest.tagline,
          description: dest.description,
          terrain: [...dest.terrain],
          activities: [...dest.activities],
          difficulty: dest.difficulty,
          bestSeason: [...dest.bestSeason],
          elevationMeters: dest.elevationMeters ? String(dest.elevationMeters) : "",
          province: dest.location.province,
          regency: dest.location.regency,
          district: dest.location.district ?? "",
          latitude: String(dest.location.coordinate.latitude),
          longitude: String(dest.location.coordinate.longitude),
          basecampName: dest.location.accessPoint?.name ?? "",
          distanceKm: dest.access.distanceKm ? String(dest.access.distanceKm) : "",
          accessDescription: dest.access.description,
          transportModes: [...dest.access.transportModes],
          estimatedTravelTime: dest.access.estimatedTravelTime,
          toilet: dest.facilities.toilet ?? false,
          warung: dest.facilities.warung ?? false,
          mushola: dest.facilities.mushola ?? false,
          parkingArea: dest.facilities.parkingArea ?? false,
          homestayNearby: dest.facilities.homestayNearby ?? false,
          guideRequired: dest.guideRequired,
          entryFee: dest.entryFee ?? "",
          status: dest.status,
          images: [...dest.images],
          tags: [...dest.tags],
          categoryIds: [...dest.categoryIds],
        });
        setSupports(await listSupports(token, dest.id));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat destinasi");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleIn(key: "terrain" | "activities" | "transportModes" | "bestSeason", value: string) {
    setForm((f) => {
      const arr = f[key];
      const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
      const nextForm = { ...f, [key]: next };
      if (key === "terrain" || key === "activities") {
        nextForm.categoryIds = deriveCategoryIds(nextForm, categories);
      }
      return nextForm;
    });
  }

  function buildPayload(statusOverride?: "draft" | "published") {
    return {
      name: form.name,
      slug: form.slug || undefined,
      tagline: form.tagline,
      description: form.description,
      terrain: form.terrain,
      activities: form.activities,
      difficulty: form.difficulty,
      status: statusOverride ?? form.status,
      bestSeason: form.bestSeason,
      location: {
        province: form.province,
        regency: form.regency,
        ...(form.district ? { district: form.district } : {}),
        coordinate: {
          latitude: Number(form.latitude) || 0,
          longitude: Number(form.longitude) || 0,
        },
        ...(form.basecampName
          ? {
              accessPoint: {
                name: form.basecampName,
                coordinate: {
                  latitude: Number(form.latitude) || 0,
                  longitude: Number(form.longitude) || 0,
                },
              },
            }
          : {}),
      },
      access: {
        description: form.accessDescription,
        transportModes: form.transportModes,
        estimatedTravelTime: form.estimatedTravelTime,
        ...(form.distanceKm ? { distanceKm: Number(form.distanceKm) } : {}),
      },
      facilities: {
        toilet: form.toilet,
        warung: form.warung,
        spotRequest: true,
        mushola: form.mushola,
        parkingArea: form.parkingArea,
        homestayNearby: form.homestayNearby,
      },
      entryFee: form.entryFee || undefined,
      images: form.images,
      tags: form.tags,
      ...(form.elevationMeters ? { elevationMeters: Number(form.elevationMeters) } : {}),
      guideRequired: form.guideRequired,
      categoryIds: form.categoryIds,
    };
  }

  /** Simpan (create/update) tanpa berpindah halaman. */
  async function persist(statusOverride?: "draft" | "published"): Promise<boolean> {
    if (!token) return false;
    const target = statusOverride ?? form.status;
    if (target === "published" && !coordsValid(form.latitude, form.longitude)) {
      setError("Isi koordinat destinasi (latitude & longitude) yang valid sebelum mempublikasikan.");
      setStep(2);
      return false;
    }
    setError(null);
    setSaving(true);
    try {
      if (isNew && !destId) {
        const created = await createDestination(token, buildPayload(statusOverride));
        setDestId(created.id);
        if (statusOverride) set("status", statusOverride);
      } else if (destId) {
        await updateDestination(token, destId, buildPayload(statusOverride));
        if (statusOverride) set("status", statusOverride);
      }
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function onSaveDraft() {
    if (await persist("draft")) {
      void navigate({ to: "/admin/categories", search: { tab: "destinasi" } });
    }
  }

  async function onPublish() {
    if (await persist()) {
      void navigate({ to: "/admin/categories", search: { tab: "destinasi" } });
    }
  }

  if (loading) {
    return <p className="text-sm text-body">Memuat...</p>;
  }

  return (
    <div className="space-y-6">
      <Steps step={step} onJump={setStep} />

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <div className="flex items-start gap-6">
        <div className="min-w-0 flex-1 space-y-6 rounded-xl border border-hairline bg-surface p-6">
          {step === 0 && <StepInfo form={form} set={set} />}
          {step === 1 && (
            <StepKlasifikasi
              form={form}
              set={set}
              toggleIn={toggleIn}
              terrainOptions={terrainOptions}
              activityOptions={activityOptions}
            />
          )}
          {step === 2 && (
            <StepLokasi
              form={form}
              set={set}
              setForm={setForm}
              toggleIn={toggleIn}
              provinces={provinces}
              regencies={regencies}
              districts={districts}
              onPick={(lat, lng) => {
                set("latitude", lat.toFixed(6));
                set("longitude", lng.toFixed(6));
                void applyReverse(lat, lng, true);
              }}
            />
          )}
          {step === 3 && (
            <StepFasilitas
              token={token}
              destinationId={destId}
              supports={supports}
              form={form}
              set={set}
              persisting={saving}
              onPersist={() => persist()}
              onChanged={async () => {
                if (token && destId) setSupports(await listSupports(token, destId));
              }}
            />
          )}
          {step === 4 && (
            <StepMedia form={form} set={set} supportsCount={supports.length} token={token} />
          )}
        </div>

        <SidePanel step={step} />
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-surface p-5">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2.5 text-sm font-semibold text-body hover:text-ink disabled:opacity-40"
        >
          <IconArrowLeft className="h-4 w-4" />
          Kembali
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={saving}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-primary hover:bg-canvas-subtle disabled:opacity-60"
          >
            Simpan draf
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover"
            >
              Lanjut
              <IconArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onPublish}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover disabled:opacity-60"
            >
              <IconCheck className="h-4 w-4" />
              {saving ? "Menyimpan..." : isNew ? "Publikasikan destinasi" : "Simpan perubahan"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Steps ------------------------------- */

function Steps({ step, onJump }: Readonly<{ step: number; onJump: (i: number) => void }>) {
  return (
    <div className="flex items-center">
      {STEPS.map((label, i) => {
        const done = i <= step;
        return (
          <Fragment key={label}>
            {i > 0 && <div className="mx-2 h-0.5 min-w-6 flex-1 bg-hairline" />}
            <button
              type="button"
              onClick={() => onJump(i)}
              className="flex shrink-0 items-center gap-2.5"
            >
              <span
                className={
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold " +
                  (done ? "bg-primary text-on-primary" : "bg-surface-2 text-body")
                }
              >
                {i + 1}
              </span>
              <span className={"text-[13px] " + (done ? "font-semibold text-ink" : "text-body")}>
                {label}
              </span>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}

function SidePanel({ step }: Readonly<{ step: number }>) {
  const meta = STEP_META[step];
  const pct = (step + 1) * 20;
  return (
    <aside className="hidden w-80 shrink-0 space-y-4 xl:block">
      {meta && (
        <div className="rounded-xl bg-canvas-subtle p-4">
          <div className="flex items-center gap-2">
            {meta.icon === "lightbulb" ? (
              <IconLightbulb className="h-4 w-4 text-warning" />
            ) : meta.icon === "camera" ? (
              <IconImage className="h-4 w-4 text-primary" />
            ) : (
              <IconInfo className="h-4 w-4 text-primary" />
            )}
            <p className="text-[13px] font-semibold text-ink">{meta.title}</p>
          </div>
          <p className="mt-2.5 text-xs leading-relaxed text-body">{meta.text}</p>
        </div>
      )}
      <div className="rounded-xl border border-hairline bg-surface p-4">
        <p className="text-[13px] font-semibold text-ink">Kelengkapan</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-3 text-xs text-body">
          Langkah {step + 1} dari 5 - {pct}%
        </p>
      </div>
    </aside>
  );
}

/* ------------------------------ Field UI ------------------------------ */

function Field({
  label,
  required,
  helper,
  children,
}: Readonly<{ label?: string; required?: boolean; helper?: string; children: React.ReactNode }>) {
  return (
    <div className="space-y-2">
      {label && (
        <p className="flex items-center gap-1 text-[13px] font-semibold text-ink">
          {label}
          {required && <span className="text-danger">*</span>}
        </p>
      )}
      {helper && <p className="text-xs text-body">{helper}</p>}
      {children}
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-[10px] border border-hairline bg-canvas px-3.5 text-sm text-ink outline-none placeholder:text-body/60 focus:border-border-strong";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls + (props.className ? " " + props.className : "")} />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        "w-full rounded-[10px] border border-hairline bg-canvas px-3.5 py-3 text-sm text-ink outline-none placeholder:text-body/60 focus:border-border-strong " +
        (props.className ?? "")
      }
    />
  );
}

function Chip({
  active,
  onClick,
  children,
}: Readonly<{ active: boolean; onClick: () => void; children: React.ReactNode }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition " +
        (active
          ? "bg-primary font-semibold text-on-primary"
          : "bg-canvas-subtle font-normal text-body hover:text-ink")
      }
    >
      {children}
      {active && <IconCheck className="h-3.5 w-3.5" />}
    </button>
  );
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: Readonly<{
  options: [string, string][];
  selected: string[];
  onToggle: (value: string) => void;
}>) {
  const extra = selected.filter((s) => !options.some(([v]) => v === s));
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([value, label]) => (
        <Chip key={value} active={selected.includes(value)} onClick={() => onToggle(value)}>
          {label}
        </Chip>
      ))}
      {extra.map((value) => (
        <Chip key={value} active onClick={() => onToggle(value)}>
          {value}
        </Chip>
      ))}
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-hairline" />;
}

/* ------------------------------ Step 1 ------------------------------- */

function StepInfo({
  form,
  set,
}: Readonly<{ form: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }>) {
  return (
    <>
      <Field label="Nama destinasi" required helper="Nama resmi yang tampil di katalog publik.">
        <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Gunung Bromo" />
      </Field>
      <Field label="Slug" required>
        <div className="flex h-11 items-center overflow-hidden rounded-[10px] border border-hairline bg-canvas focus-within:border-border-strong">
          <span className="pl-3.5 text-sm text-body">dolenae.id/destinasi/</span>
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="otomatis dari nama"
            className="h-full flex-1 bg-transparent pr-3.5 text-sm text-ink outline-none placeholder:text-body/60"
          />
        </div>
      </Field>
      <Field label="Tagline" required>
        <TextInput value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Sunrise di lautan pasir" />
      </Field>
      <Field label="Deskripsi" required>
        <RichText value={form.description} onChange={(v) => set("description", v)} />
      </Field>
    </>
  );
}

function RichText({ value, onChange }: Readonly<{ value: string; onChange: (v: string) => void }>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function wrap(before: string, after = before) {
    const t = ref.current;
    if (!t) return;
    const s = t.selectionStart ?? 0;
    const e = t.selectionEnd ?? 0;
    const next = value.slice(0, s) + before + value.slice(s, e) + after + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      t.focus();
      t.setSelectionRange(s + before.length, e + before.length);
    });
  }

  function prefix(p: string) {
    const t = ref.current;
    if (!t) return;
    const s = t.selectionStart ?? 0;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    onChange(value.slice(0, lineStart) + p + value.slice(lineStart));
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-hairline bg-canvas">
      <div className="flex items-center gap-0.5 border-b border-hairline bg-surface-2 px-2 py-2">
        <ToolBtn title="Tebal" onClick={() => wrap("**")}>
          <IconBold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn title="Miring" onClick={() => wrap("_")}>
          <IconItalic className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn title="Garis bawah" onClick={() => wrap("<u>", "</u>")}>
          <IconUnderline className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn title="Coret" onClick={() => wrap("~~")}>
          <IconStrikethrough className="h-4 w-4" />
        </ToolBtn>
        <span className="mx-1 h-5 w-px bg-hairline" />
        <ToolBtn title="Heading 1" onClick={() => prefix("# ")}>
          <IconHeading1 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn title="Heading 2" onClick={() => prefix("## ")}>
          <IconHeading2 className="h-4 w-4" />
        </ToolBtn>
        <span className="mx-1 h-5 w-px bg-hairline" />
        <ToolBtn title="Daftar" onClick={() => prefix("- ")}>
          <IconList className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn title="Daftar bernomor" onClick={() => prefix("1. ")}>
          <IconListOrdered className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn title="Kutipan" onClick={() => prefix("> ")}>
          <IconQuote className="h-4 w-4" />
        </ToolBtn>
        <span className="mx-1 h-5 w-px bg-hairline" />
        <ToolBtn title="Tautan" onClick={() => wrap("[", "](https://)")}>
          <IconLink className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn title="Gambar" onClick={() => wrap("![gambar](", ")")}>
          <IconImage className="h-4 w-4" />
        </ToolBtn>
        <span className="flex-1" />
        <ToolBtn title="Undo" onClick={() => document.execCommand?.("undo")}>
          <IconUndo className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn title="Redo" onClick={() => document.execCommand?.("redo")}>
          <IconRedo className="h-4 w-4" />
        </ToolBtn>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        placeholder="Tulis deskripsi destinasi..."
        className="w-full resize-y bg-transparent px-4 py-3.5 text-sm leading-relaxed text-ink outline-none placeholder:text-body/60"
      />
    </div>
  );
}

function ToolBtn({
  title,
  onClick,
  children,
}: Readonly<{ title: string; onClick: () => void; children: React.ReactNode }>) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md text-body hover:bg-surface hover:text-ink"
    >
      {children}
    </button>
  );
}

/* ------------------------------ Step 2 ------------------------------- */

function StepKlasifikasi({
  form,
  set,
  toggleIn,
  terrainOptions,
  activityOptions,
}: Readonly<{
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  toggleIn: (k: "terrain" | "activities" | "transportModes" | "bestSeason", v: string) => void;
  terrainOptions: [string, string][];
  activityOptions: [string, string][];
}>) {
  return (
    <>
      <Field label="Terrain" required helper="Pilih satu atau lebih karakteristik medan destinasi.">
        <ChipGroup options={terrainOptions} selected={form.terrain} onToggle={(v) => toggleIn("terrain", v)} />
      </Field>
      <Divider />
      <Field label="Aktivitas" required helper="Aktivitas yang bisa dilakukan wisatawan di destinasi ini.">
        <ChipGroup options={activityOptions} selected={form.activities} onToggle={(v) => toggleIn("activities", v)} />
      </Field>
      <Divider />
      <Field label="Tingkat kesulitan" required>
        <div className="inline-flex flex-wrap gap-1 rounded-[10px] bg-surface-2 p-1">
          {DIFFICULTIES.map((d) => {
            const active = form.difficulty === d.value;
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => set("difficulty", d.value)}
                className={
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] transition " +
                  (active ? "bg-surface font-semibold text-ink shadow-sm" : "text-body hover:text-ink")
                }
              >
                <span className={"h-1.5 w-1.5 rounded-full " + d.dot} />
                {d.label}
              </button>
            );
          })}
        </div>
      </Field>
      <Divider />
      <Field label="Musim terbaik">
        <ChipGroup options={SEASONS.map((s) => [s, s] as [string, string])} selected={form.bestSeason} onToggle={(v) => toggleIn("bestSeason", v)} />
      </Field>
      <Divider />
      <Field label="Wajib lokal guide">
        <div className="flex h-11 items-center">
          <Chip active={form.guideRequired} onClick={() => set("guideRequired", !form.guideRequired)}>
            {form.guideRequired ? "Wajib guide" : "Tidak wajib"}
          </Chip>
        </div>
      </Field>
    </>
  );
}

/* ------------------------------ Step 3 ------------------------------- */

function StepLokasi({
  form,
  set,
  setForm,
  toggleIn,
  provinces,
  regencies,
  districts,
  onPick,
}: Readonly<{
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  toggleIn: (k: "terrain" | "activities" | "transportModes" | "bestSeason", v: string) => void;
  provinces: string[];
  regencies: string[];
  districts: string[];
  onPick: (lat: number, lng: number) => void;
}>) {
  return (
    <>
      <div className="flex items-center gap-2">
        <IconMapPin className="h-4 w-4 text-primary" />
        <h3 className="text-[15px] font-semibold text-ink">Lokasi</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Provinsi" required>
          <SearchableSelect
            value={form.province}
            options={provinces}
            placeholder="Pilih provinsi"
            onChange={(v) => {
              if (v === form.province) return;
              setForm((f) => ({ ...f, province: v, regency: "", district: "" }));
            }}
          />
        </Field>
        <Field label="Kabupaten / Kota" required>
          <SearchableSelect
            value={form.regency}
            options={regencies}
            placeholder={form.province ? "Pilih kabupaten/kota" : "Pilih provinsi dulu"}
            onChange={(v) => {
              if (v === form.regency) return;
              setForm((f) => ({ ...f, regency: v, district: "" }));
            }}
          />
        </Field>
        <Field label="Kecamatan">
          <SearchableSelect
            value={form.district}
            options={districts}
            placeholder={form.regency ? "Pilih kecamatan" : "Pilih kabupaten dulu"}
            onChange={(v) => set("district", v)}
          />
        </Field>
        <Field label="Ketinggian (mdpl)">
          <TextInput
            value={form.elevationMeters}
            onChange={(e) => set("elevationMeters", e.target.value)}
            placeholder="2329"
          />
        </Field>
        <Field label="Latitude">
          <TextInput value={form.latitude} onChange={(e) => set("latitude", e.target.value)} placeholder="-7.9425" />
        </Field>
        <Field label="Longitude">
          <TextInput value={form.longitude} onChange={(e) => set("longitude", e.target.value)} placeholder="112.9531" />
        </Field>
      </div>

      <MapPicker
        name={form.name}
        meta={[form.district, form.regency].filter(Boolean).join(" · ")}
        latitude={form.latitude}
        longitude={form.longitude}
        onReset={() => {
          set("latitude", "");
          set("longitude", "");
        }}
        onPick={onPick}
      />

      <Divider />
      <div className="flex items-center gap-2">
        <IconFlag className="h-4 w-4 text-primary" />
        <h3 className="text-[15px] font-semibold text-ink">Titik akses / basecamp</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nama basecamp">
          <TextInput value={form.basecampName} onChange={(e) => set("basecampName", e.target.value)} placeholder="Cemoro Lawang" />
        </Field>
        <Field label="Jarak dari kota (km)">
          <TextInput value={form.distanceKm} onChange={(e) => set("distanceKm", e.target.value)} placeholder="140" />
        </Field>
      </div>

      <Divider />
      <div className="flex items-center gap-2">
        <IconCar className="h-4 w-4 text-primary" />
        <h3 className="text-[15px] font-semibold text-ink">Akses &amp; transportasi</h3>
      </div>
      <Field label="Deskripsi akses" required>
        <TextArea
          rows={4}
          value={form.accessDescription}
          onChange={(e) => set("accessDescription", e.target.value)}
          placeholder="Dari Surabaya via Probolinggo, lanjut ke Cemoro Lawang..."
        />
      </Field>
      <Field label="Moda transport yang didukung">
        <ChipGroup
          options={TRANSPORT_MODES.map((m) => [m, m.replace(/(^|-)(\w)/g, (_, a, b) => a.replace("-", " ") + b.toUpperCase())] as [string, string])}
          selected={form.transportModes}
          onToggle={(v) => toggleIn("transportModes", v)}
        />
      </Field>
      <Field label="Estimasi waktu tempuh">
        <TextInput
          value={form.estimatedTravelTime}
          onChange={(e) => set("estimatedTravelTime", e.target.value)}
          placeholder="+/- 4 jam dari Surabaya"
        />
      </Field>
    </>
  );
}

function MapPicker({
  name,
  meta,
  latitude,
  longitude,
  onReset,
  onPick,
}: Readonly<{
  name: string;
  meta: string;
  latitude: string;
  longitude: string;
  onReset: () => void;
  onPick: (lat: number, lng: number) => void;
}>) {
  const valid = coordsValid(latitude, longitude);
  const points = valid
    ? [
        {
          id: "destination",
          lat: Number(latitude),
          lng: Number(longitude),
          label: name || "Lokasi destinasi",
          meta,
        },
      ]
    : [];

  return (
    <div className="rounded-[10px] border border-hairline bg-canvas p-4">
      <div className="flex items-start gap-2">
        <IconCrosshair className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="text-[13px] font-semibold text-ink">Pilih titik di peta</p>
          <p className="mt-0.5 text-xs text-body">
            Klik peta untuk menaruh pin lokasi destinasi, atau isi koordinat manual.
          </p>
        </div>
      </div>

      <div className="mt-3">
        <MapView height={340} points={points} onPick={onPick} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-body">
          <IconMapPin className="h-3.5 w-3.5 text-primary" />
          <span>Latitude</span>
          <span className="rounded-lg border border-hairline bg-surface px-2.5 py-1.5 text-ink">
            {latitude || "—"}
          </span>
          <span>Longitude</span>
          <span className="rounded-lg border border-hairline bg-surface px-2.5 py-1.5 text-ink">
            {longitude || "—"}
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold text-body hover:bg-canvas-subtle hover:text-ink"
        >
          <IconRotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {!valid && (
        <p className="mt-2 text-xs text-danger">
          Latitude &amp; longitude wajib diisi (bukan 0,0) sebelum publikasi.
        </p>
      )}
    </div>
  );
}

/* ------------------------------ Step 4 ------------------------------- */

const SUPPORT_TYPES = [
  { value: "accommodation", label: "Penginapan", icon: "bed" },
  { value: "transport", label: "Transport", icon: "car" },
  { value: "food", label: "Makanan", icon: "utensils" },
] as const;

const COMMON_FACILITIES = [
  ["toilet", "Toilet"],
  ["warung", "Warung"],
  ["mushola", "Mushola"],
  ["parkingArea", "Parkir"],
  ["homestayNearby", "Homestay dekat"],
] as const;

function StepFasilitas({
  token,
  destinationId,
  supports,
  form,
  set,
  persisting,
  onPersist,
  onChanged,
}: Readonly<{
  token: string | null;
  destinationId: string | null;
  supports: TravelSupport[];
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  persisting: boolean;
  onPersist: () => Promise<boolean>;
  onChanged: () => Promise<void>;
}>) {
  const [type, setType] = useState<TravelSupport["type"]>("accommodation");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = supports.filter((s) => s.type === type);
  const countOf = (t: TravelSupport["type"]) => supports.filter((s) => s.type === t).length;

  async function add() {
    if (!token || !destinationId || !name.trim()) return;
    setBusy(true);
    try {
      await createSupport(token, {
        destinationId,
        type,
        name: name.trim(),
        ...(image ? { image } : {}),
        ...(type === "accommodation" ? { pricePerNight: 0, capacity: "", facilities: [] } : {}),
        ...(type === "transport" ? { mode: "mobil", routes: [], price: 0 } : {}),
        ...(type === "food" ? { cuisine: [] } : {}),
      });
      setName("");
      setImage("");
      setAdding(false);
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function toggleVerified(s: TravelSupport) {
    if (!token) return;
    await updateSupport(token, s.id, { verified: !s.verified });
    await onChanged();
  }

  async function remove(id: string) {
    if (!token) return;
    if (!confirm("Hapus fasilitas ini?")) return;
    const target = supports.find((s) => s.id === id);
    await deleteSupport(token, id);
    // Bersihkan foto agar tidak jadi berkas yatim (best-effort).
    if (target?.image) {
      try {
        await deleteUpload(token, target.image);
      } catch {
        // abaikan: fasilitas tetap terhapus walau berkas gagal dibersihkan
      }
    }
    await onChanged();
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-ink">Fasilitas di sekitar destinasi</h3>
          <p className="mt-0.5 text-xs text-body">
            Kelola penginapan, transportasi, dan tempat makan di sekitar destinasi.
          </p>
        </div>
        <button
          type="button"
          onClick={() => (destinationId ? setAdding((v) => !v) : void onPersist())}
          disabled={persisting}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover disabled:opacity-60"
        >
          <IconPlus className="h-4 w-4" />
          Tambah fasilitas
        </button>
      </div>

      {!destinationId && (
        <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-body">
          Simpan destinasi terlebih dahulu (tombol “Simpan draf”) untuk mengelola fasilitas.
        </p>
      )}

      {/* Tipe tabs */}
      <div className="inline-flex flex-wrap gap-1 rounded-[10px] bg-surface-2 p-1">
        {SUPPORT_TYPES.map((t) => {
          const active = type === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] transition " +
                (active ? "bg-surface font-semibold text-ink shadow-sm" : "text-body hover:text-ink")
              }
            >
              <SupportIcon name={t.icon} />
              {t.label}
              <span className="rounded-full bg-canvas-subtle px-1.5 py-0.5 text-[11px] font-semibold text-body">
                {countOf(t.value)}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((s) => (
          <div key={s.id} className="flex items-center gap-4 rounded-xl border border-hairline bg-canvas p-4">
            {s.image ? (
              <div
                className="h-11 w-11 shrink-0 rounded-[10px] bg-canvas-subtle bg-cover bg-center"
                style={{ backgroundImage: `url(${s.image})` }}
              />
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-canvas-subtle text-primary">
                <SupportIcon name={type} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-ink">{s.name}</p>
                <button
                  type="button"
                  onClick={() => toggleVerified(s)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-ink"
                >
                  <span className={"h-1.5 w-1.5 rounded-full " + (s.verified ? "bg-success" : "bg-warning")} />
                  {s.verified ? "Terverifikasi" : "Menunggu"}
                </button>
              </div>
              <p className="mt-1 truncate text-xs text-body">{supportMeta(s)}</p>
            </div>
            {supportPrice(s) && (
              <div className="hidden shrink-0 text-right sm:block">
                <p className="text-sm font-semibold text-ink">{supportPrice(s)?.value}</p>
                <p className="text-[11px] text-body">{supportPrice(s)?.unit}</p>
              </div>
            )}
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => remove(s.id)}
                title="Hapus"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-body hover:text-danger"
              >
                <IconTrash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-hairline px-4 py-6 text-center text-sm text-body">
            Belum ada fasilitas {SUPPORT_TYPES.find((t) => t.value === type)?.label.toLowerCase()}.
          </p>
        )}
      </div>

      {adding && destinationId && (
        <div className="space-y-3 rounded-xl bg-surface-2 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama fasilitas"
              className="h-10 flex-1 rounded-[10px] border border-hairline bg-surface px-3 text-sm text-ink outline-none"
            />
            <button
              type="button"
              onClick={add}
              disabled={busy}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-on-primary disabled:opacity-60"
            >
              {busy ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-full px-3 py-2 text-xs font-semibold text-body hover:text-ink"
            >
              Batal
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-body">Foto (opsional)</span>
            <SupportImageUploader
              token={token}
              value={image}
              onChange={setImage}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-body">
        <IconInfo className="h-3.5 w-3.5" />
        Fasilitas yang ditambahkan akan tampil di halaman detail destinasi publik.
      </div>

      <Divider />
      <Field label="Fasilitas umum di lokasi">
        <div className="flex flex-wrap gap-2">
          {COMMON_FACILITIES.map(([key, label]) => (
            <Chip key={key} active={form[key]} onClick={() => set(key, !form[key])}>
              {label}
            </Chip>
          ))}
        </div>
      </Field>
    </>
  );
}

/** Unggah satu foto fasilitas (dipakai saat menambah fasilitas). */
function SupportImageUploader({
  token,
  value,
  onChange,
}: Readonly<{
  token: string | null;
  value: string;
  onChange: (url: string) => void;
}>) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(files: FileList | null) {
    const file = files?.[0];
    if (!file || !token) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded = await uploadImage(token, file, "supports");
      onChange(uploaded.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    const url = value;
    onChange("");
    if (token && url) {
      try {
        await deleteUpload(token, url);
      } catch {
        // berdiam: hapus berkas bersifat best-effort
      }
    }
  }

  if (value) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface py-1 pl-1 pr-2">
        <span
          className="h-7 w-7 rounded-full bg-canvas-subtle bg-cover bg-center"
          style={{ backgroundImage: `url(${value})` }}
        />
        <button
          type="button"
          onClick={clear}
          className="flex h-6 w-6 items-center justify-center rounded-md text-body hover:text-danger"
          aria-label="Hapus foto"
        >
          <IconX className="h-3.5 w-3.5" />
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <label
        className={
          "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas " +
          (busy ? "pointer-events-none opacity-60" : "")
        }
      >
        <IconUploadCloud className="h-3.5 w-3.5" />
        {busy ? "Mengunggah…" : "Pilih foto"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            void pick(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {error && <span className="text-[11px] text-danger">{error}</span>}
    </span>
  );
}

function SupportIcon({ name }: Readonly<{ name: string }>) {
  if (name === "accommodation" || name === "bed") return <IconBed className="h-4 w-4" />;
  if (name === "transport" || name === "car") return <IconCar className="h-4 w-4" />;
  return <IconUtensils className="h-4 w-4" />;
}

function supportMeta(s: TravelSupport): string {
  if (s.type === "accommodation") {
    return ["Penginapan", s.capacity, s.facilities?.join(", ")].filter(Boolean).join(" · ");
  }
  if (s.type === "transport") {
    return ["Transport", s.mode, s.capacitySeats ? `${s.capacitySeats} kursi` : ""].filter(Boolean).join(" · ");
  }
  return ["Makanan", s.cuisine?.join(", ")].filter(Boolean).join(" · ");
}

function supportPrice(s: TravelSupport): { value: string; unit: string } | null {
  const rp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
  if (s.type === "accommodation" && typeof s.pricePerNight === "number") {
    return { value: rp(s.pricePerNight), unit: "per malam" };
  }
  if (s.type === "transport" && typeof s.price === "number") {
    return { value: rp(s.price), unit: "per trip" };
  }
  return null;
}

/* ------------------------------ Step 5 ------------------------------- */

function StepMedia({
  form,
  set,
  supportsCount,
  token,
}: Readonly<{
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  supportsCount: number;
  token: string | null;
}>) {
  const [imageUrl, setImageUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function addUrl(url: string) {
    if (!url || form.images.includes(url)) return;
    set("images", [...form.images, url]);
  }

  /** Lepas foto dari daftar + hapus berkas di storage (best-effort). */
  function removeImage(url: string) {
    set("images", form.images.filter((u) => u !== url));
    if (token) {
      void deleteUpload(token, url).catch(() => undefined);
    }
  }

  function addImage() {
    const url = imageUrl.trim();
    addUrl(url);
    setImageUrl("");
  }

  async function uploadFiles(files: FileList | File[]) {
    if (!token) {
      setUploadError("Sesi tidak ditemukan. Masuk ulang sebagai admin.");
      return;
    }
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;

    setUploading(true);
    setUploadError(null);
    try {
      for (const file of list) {
        const uploaded = await uploadImage(token, file, "destinations");
        addUrl(uploaded.url);
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  function addTag() {
    const t = tagInput.trim().replace(/,$/, "");
    if (!t || form.tags.includes(t)) return;
    set("tags", [...form.tags, t]);
    setTagInput("");
  }

  return (
    <>
      {/* Media */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <IconImage className="h-4 w-4 text-primary" />
            <h3 className="text-[15px] font-semibold text-ink">Foto destinasi</h3>
          </div>
          <span className="text-xs text-body">
            {form.images.length > 0 ? "1 foto utama" : "Belum ada foto"} · maks 6 foto
          </span>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void uploadFiles(e.dataTransfer.files);
          }}
          className={
            "flex flex-col items-center gap-2 rounded-xl border border-dashed bg-canvas px-4 py-6 text-center transition " +
            (dragging ? "border-primary bg-canvas-subtle" : "border-border-strong")
          }
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas-subtle text-primary">
            <IconUploadCloud className="h-6 w-6" />
          </span>
          <p className="text-sm font-semibold text-ink">
            {uploading ? "Mengunggah…" : "Tarik & lepas foto di sini"}
          </p>
          <p className="text-xs text-body">atau unggah dari perangkat · PNG/JPG/WebP</p>

          <label
            className={
              "mt-1 inline-flex cursor-pointer items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-surface-2 " +
              (uploading ? "pointer-events-none opacity-60" : "")
            }
          >
            <IconFolderOpen className="h-3.5 w-3.5" />
            Pilih file
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) void uploadFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>

          <div className="mt-1 flex w-full max-w-md items-center gap-2">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="atau tempel URL gambar..."
              className="h-10 flex-1 rounded-full border border-hairline bg-surface px-4 text-sm text-ink outline-none placeholder:text-body/60 focus:border-border-strong"
            />
            <button
              type="button"
              onClick={addImage}
              className="rounded-full border border-hairline bg-surface px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-surface-2"
            >
              Tambah
            </button>
          </div>

          {uploadError && <p className="text-[11px] text-danger">{uploadError}</p>}
        </div>

        {form.images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {form.images.map((url, i) => (
              <div key={url} className="relative overflow-hidden rounded-[10px] border border-hairline bg-canvas-subtle">
                <div className="h-24 bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />
                <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                  <span className="truncate text-[10px] text-body">{url.split("/").pop()}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface text-body hover:text-danger"
                    aria-label="Hapus foto"
                  >
                    <IconX className="h-3.5 w-3.5" />
                  </button>
                </div>
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-on-primary">
                    Utama
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Divider />

      <Field label="Tags">
        <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-[10px] border border-hairline bg-canvas px-3 py-2 focus-within:border-border-strong">
          {form.tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs text-ink">
              {t}
              <button
                type="button"
                onClick={() => set("tags", form.tags.filter((x) => x !== t))}
                aria-label={`Hapus tag ${t}`}
              >
                <IconX className="h-3 w-3 text-body" />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            onBlur={addTag}
            placeholder="Tambah tag..."
            className="min-w-24 flex-1 bg-transparent py-1 text-sm text-ink outline-none placeholder:text-body/60"
          />
        </div>
      </Field>

      <Divider />

      <Field label="Harga tiket masuk">
        <TextInput
          value={form.entryFee}
          onChange={(e) => set("entryFee", e.target.value)}
          placeholder="Rp 29.000"
        />
      </Field>

      <Divider />

      <Field label="Status publikasi">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(
            [
              ["published", "Publikasikan", "Langsung tampil di katalog publik."],
              ["draft", "Simpan sebagai draf", "Hanya terlihat oleh admin."],
            ] as const
          ).map(([value, title, desc]) => {
            const active = form.status === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => set("status", value)}
                className={
                  "flex items-start gap-3 rounded-[10px] bg-canvas p-4 text-left transition " +
                  (active ? "border-2 border-border-strong" : "border border-hairline")
                }
              >
                <span
                  className={
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border " +
                    (active ? "border-primary" : "border-hairline")
                  }
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">{title}</span>
                  <span className="mt-0.5 block text-xs text-body">{desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Field>

      <Divider />

      <div className="space-y-3">
        <h3 className="text-[15px] font-semibold text-ink">Ringkasan</h3>
        <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
          <ReviewRow label="Nama" value={form.name || "—"} />
          <ReviewRow label="Provinsi" value={form.province || "—"} />
          <ReviewRow label="Kesulitan" value={DIFFICULTIES.find((d) => d.value === form.difficulty)?.label ?? form.difficulty} />
          <ReviewRow label="Terrain" value={form.terrain.join(", ") || "—"} />
          <ReviewRow label="Elevasi" value={form.elevationMeters ? `${Number(form.elevationMeters).toLocaleString("id-ID")} mdpl` : "—"} />
          <ReviewRow label="Fasilitas" value={`${supportsCount} tersedia`} />
        </div>
      </div>
    </>
  );
}

function ReviewRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-2">
      <span className="text-[13px] text-body">{label}</span>
      <span className="text-right text-[13px] font-semibold text-ink">{value}</span>
    </div>
  );
}

/* ------------------------------ helpers ------------------------------ */

/** Valid: bukan kosong, dalam rentang, dan bukan (0,0). */
function coordsValid(lat: string, lng: string): boolean {
  if (!lat.trim() || !lng.trim()) return false;
  const la = Number(lat);
  const lo = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return false;
  if (la < -90 || la > 90 || lo < -180 || lo > 180) return false;
  if (la === 0 && lo === 0) return false;
  return true;
}

/** Turunkan `categoryIds` dari chip terrain/aktivitas (slug → id). */
function deriveCategoryIds(
  form: Pick<FormState, "terrain" | "activities" | "categoryIds">,
  categories: Category[],
): string[] {
  const selected = new Set([...form.terrain, ...form.activities]);
  const known = new Set(categories.map((c) => c.id));
  const fromChips = categories.filter((c) => selected.has(c.slug)).map((c) => c.id);
  const unknown = form.categoryIds.filter((id) => !known.has(id));
  return [...new Set([...unknown, ...fromChips])];
}
