"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "~/components/ui/dialog";
import { useToast } from "~/components/ui/toaster";
import { ApiError } from "~/lib/api/types";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { cn } from "~/lib/cn";
import { DestinationFormStepper } from "./components/destination-form-stepper";
import { FasilitasStep } from "./components/destination-form-steps/fasilitas-step";
import { InfoStep } from "./components/destination-form-steps/info-step";
import { KlasifikasiStep } from "./components/destination-form-steps/klasifikasi-step";
import { LokasiStep } from "./components/destination-form-steps/lokasi-step";
import { MediaStep } from "./components/destination-form-steps/media-step";
import type {
  FormErrors,
  StepProps,
} from "./components/destination-form-steps/types";
import {
  useCategories,
  useDestination,
  useSaveDestination,
} from "./hooks/use-destinations";
import {
  destinationFormSchema,
  emptyDestinationForm,
  toDestinationForm,
  toDestinationPayload,
  type DestinationForm as DestinationFormValues,
} from "./schema";

const STEPS = [
  { key: "info", label: "Info Dasar" },
  { key: "klasifikasi", label: "Klasifikasi" },
  { key: "lokasi", label: "Lokasi & Akses" },
  { key: "fasilitas", label: "Fasilitas & Biaya" },
  { key: "media", label: "Media & Publikasi" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const stepFields: Record<StepKey, (keyof DestinationFormValues)[]> = {
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
  error instanceof Error
    ? error.message
    : "Permintaan gagal. Silakan coba lagi.";

export function DestinationForm({ destinationId }: { destinationId?: string }) {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const editing = Boolean(destinationId);

  const [step, setStep] = useState(0);
  const [values, setValues] =
    useState<DestinationFormValues>(emptyDestinationForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageDraft, setImageDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [loaded, setLoaded] = useState(!editing);
  const [dirty, setDirty] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const enabled = auth.hydrated && !!auth.token && auth.user?.role === "admin";

  const categories = useCategories(enabled);
  const detail = useDestination(destinationId, enabled && editing);

  const mutation = useSaveDestination({
    editing,
    id: destinationId,
    token: auth.token ?? undefined,
    onSaved: (destination) => {
      setDirty(false);
      toast({
        title: editing
          ? "Perubahan destinasi disimpan."
          : `Destinasi "${destination.name}" berhasil dibuat.`,
        variant: "success",
      });
      router.push("/admin/destinasi");
    },
  });

  useEffect(() => {
    if (auth.hydrated && !auth.token) router.replace("/auth/login");
  }, [auth.hydrated, auth.token, router]);

  useEffect(() => {
    if (!detail.data || loaded) return;
    setValues(toDestinationForm(detail.data.data));
    setLoaded(true);
  }, [detail.data, loaded]);

  useEffect(() => {
    const error = mutation.error ?? detail.error;
    if (error instanceof ApiError && error.status === 401) {
      auth.logout();
      router.replace("/auth/login");
    }
  }, [mutation.error, detail.error, auth, router]);

  const set = <K extends keyof DestinationFormValues>(
    key: K,
    value: DestinationFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setDirty(true);
  };

  // Warn before leaving with unsaved edits (refresh, tab close, back).
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const issueFields = () => {
    const parsed = destinationFormSchema.safeParse(values);
    return parsed.success
      ? new Set<keyof DestinationFormValues>()
      : new Set(
          parsed.error.issues.map(
            (issue) => issue.path[0] as keyof DestinationFormValues,
          ),
        );
  };

  /** Validate the whole form, or only the fields of the current step. */
  const validate = (keys?: (keyof DestinationFormValues)[]) => {
    const parsed = destinationFormSchema.safeParse(values);
    if (parsed.success) {
      setErrors({});
      return parsed.data;
    }
    const nextErrors: FormErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof DestinationFormValues;
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
    if (validate(stepFields[key])) {
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    }
  };

  const submit = (status?: DestinationFormValues["status"]) => {
    const parsed = validate();
    if (!parsed) {
      const invalid = issueFields();
      const firstInvalid = STEPS.findIndex((entry) =>
        stepFields[entry.key].some((field) => invalid.has(field)),
      );
      if (firstInvalid >= 0) setStep(firstInvalid);
      return;
    }
    setNotice("");
    mutation.mutate(
      toDestinationPayload({ ...parsed, status: status ?? parsed.status }),
    );
  };

  const saveDraft = () => {
    if (values.name.trim().length < 2) {
      setErrors((prev) => ({ ...prev, name: "Nama minimal 2 karakter" }));
      setNotice("Isi nama destinasi sebelum menyimpan draf.");
      setStep(0);
      return;
    }
    // Drafts only require a name; incomplete fields are completed later.
    const parsed = destinationFormSchema.safeParse({
      ...values,
      status: "draft",
    });
    if (!parsed.success) {
      setNotice("Periksa kembali angka dan slug sebelum menyimpan draf.");
      return;
    }
    setNotice("");
    mutation.mutate(toDestinationPayload(parsed.data));
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
        <h2 className="font-display text-xl font-bold text-ink">
          Akses ditolak
        </h2>
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
      <div
        role="alert"
        className="rounded-xl border border-hairline bg-surface p-6"
      >
        <p className="text-sm text-danger">{message(detail.error)}</p>
        <Button
          variant="secondary"
          className="mt-3"
          onClick={() => router.push("/admin/destinasi")}
        >
          Kembali ke daftar
        </Button>
      </div>
    );
  }

  const currentKey = STEPS[step]!.key;
  const stepProps: StepProps = { values, errors, set };

  const stepContent = () => {
    switch (currentKey) {
      case "info":
        return <InfoStep {...stepProps} />;
      case "klasifikasi":
        return (
          <KlasifikasiStep
            {...stepProps}
            categories={categoryList}
            categoriesPending={categories.isPending}
            selectedCount={selectedCount}
          />
        );
      case "lokasi":
        return <LokasiStep {...stepProps} />;
      case "fasilitas":
        return <FasilitasStep {...stepProps} />;
      case "media":
        return (
          <MediaStep
            {...stepProps}
            imageDraft={imageDraft}
            onImageDraftChange={setImageDraft}
          />
        );
    }
  };

  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              dirty ? setConfirmLeave(true) : router.push("/admin/destinasi")
            }
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

      <DestinationFormStepper
        steps={STEPS}
        current={step}
        onSelect={setStep}
      />

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
        {stepContent()}
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
            onClick={saveDraft}
          >
            Simpan draf
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>
              Lanjut
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => submit(editing ? undefined : "published")}
              disabled={mutation.isPending}
            >
              {mutation.isPending && (
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              )}
              {editing ? "Simpan perubahan" : "Publikasikan destinasi"}
            </Button>
          )}
        </div>
      </div>

      <p className="flex items-center gap-1 text-xs text-body">
        <Plus aria-hidden className="h-3 w-3" />
        Field bertanda opsional boleh dikosongkan; data dapat dilengkapi nanti.
      </p>

      {confirmLeave && (
        <Dialog open onOpenChange={(open) => !open && setConfirmLeave(false)}>
          <DialogContent className="w-[420px]">
            <DialogTitle>Tinggalkan formulir?</DialogTitle>
            <DialogDescription>
              Perubahan yang belum disimpan akan hilang.
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setConfirmLeave(false)}
              >
                Batal
              </Button>
              <Button
                className="bg-danger hover:bg-danger/90"
                onClick={() => {
                  setDirty(false);
                  router.push("/admin/destinasi");
                }}
              >
                Tinggalkan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
