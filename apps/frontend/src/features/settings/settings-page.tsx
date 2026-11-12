"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  Loader2,
  PlugZap,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { useToast } from "~/components/ui/toaster";
import { ApiError } from "~/lib/api/types";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { cn } from "~/lib/cn";
import type { GeminiModel } from "./api/ai-settings";
import {
  useAiSettings,
  useGeminiModels,
  useTestAi,
  useUpdateAiSettings,
} from "./hooks/use-ai-settings";

const message = (error: unknown) => {
  if (error instanceof ApiError) {
    const details = error.details as { reason?: string } | undefined;
    return details?.reason
      ? `${error.message} (${details.reason})`
      : error.message;
  }
  return error instanceof Error
    ? error.message
    : "Permintaan gagal. Silakan coba lagi.";
};

const DEFAULT_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
];

export function SettingsPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const enabled =
    auth.hydrated && !!auth.token && auth.user?.role === "admin";

  const settings = useAiSettings(auth.token, enabled);
  const update = useUpdateAiSettings(auth.token, () =>
    toast({ title: "Pengaturan AI disimpan", variant: "success" }),
  );
  const modelsMutation = useGeminiModels(auth.token);
  const testMutation = useTestAi(auth.token);

  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-3.5-flash");
  const [models, setModels] = useState<GeminiModel[]>([]);
  const [prompt, setPrompt] = useState(
    "Balas dengan satu kalimat: koneksi berhasil.",
  );

  const handleError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      auth.logout();
      router.replace("/auth/login");
      toast({
        title: "Sesi admin berakhir. Silakan masuk lagi.",
        variant: "danger",
      });
      return;
    }
    toast({ title: message(error), variant: "danger" });
  };

  useEffect(() => {
    if (settings.data?.data.model) setModel(settings.data.data.model);
  }, [settings.data]);

  useEffect(() => {
    if (auth.hydrated && !auth.token) router.replace("/auth/login");
  }, [auth.hydrated, auth.token, router]);

  useEffect(() => {
    if (
      settings.error instanceof ApiError &&
      settings.error.status === 401
    ) {
      auth.logout();
      router.replace("/auth/login");
    }
  }, [settings.error, auth, router]);

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
        <Link
          href="/"
          className="mt-3 inline-block text-sm font-semibold text-primary underline"
        >
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  const data = settings.data?.data;
  const options = (() => {
    const values = new Set<string>([
      ...DEFAULT_MODELS,
      ...models.map((item) => item.id),
      ...(data?.model ? [data.model] : []),
    ]);
    return [...values].map((value) => ({
      value,
      label: models.find((item) => item.id === value)?.displayName ?? value,
    }));
  })();

  const save = () => {
    update.mutate(
      {
        ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
        model,
      },
      {
        onSuccess: () => setApiKey(""),
        onError: handleError,
      },
    );
  };

  const loadModels = () => {
    modelsMutation.mutate(undefined, {
      onSuccess: (result) => {
        setModels(result.data);
        toast({
          title: `${result.data.length} model tersedia`,
          variant: "success",
        });
      },
      onError: handleError,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">Pengaturan</h2>
        <p className="mt-1 text-sm text-body">
          Kelola integrasi layanan yang dipakai Dolenae.
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-hairline bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-canvas-subtle text-primary">
              <KeyRound aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-ink">
                Google Gemini
              </h3>
              <p className="text-sm text-body">
                Dipakai untuk menyusun itinerary dan briefing AI.
              </p>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
              data?.hasKey
                ? "bg-success/10 text-success"
                : "bg-warning/10 text-warning",
            )}
          >
            {data?.hasKey ? (
              <CheckCircle2 aria-hidden className="h-3.5 w-3.5" />
            ) : (
              <ShieldAlert aria-hidden className="h-3.5 w-3.5" />
            )}
            {data?.hasKey ? "API key tersimpan" : "Belum ada API key"}
          </span>
        </div>

        {settings.isPending ? (
          <p role="status" className="text-sm text-body">
            Memuat pengaturan…
          </p>
        ) : settings.isError ? (
          <div role="alert" className="rounded-lg border border-hairline p-4">
            <p className="text-sm text-danger">{message(settings.error)}</p>
            <Button
              variant="secondary"
              className="mt-2"
              onClick={() => settings.refetch()}
            >
              Coba lagi
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-body">
                  API key
                </span>
                <Input
                  type="password"
                  autoComplete="off"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder={data?.keyPreview ?? "AIza…"}
                />
                <span className="text-[11px] text-body">
                  {data?.hasKey
                    ? `Tersimpan: ${data.keyPreview} · kosongkan jika tidak diubah.`
                    : "Tempel API key dari Google AI Studio."}
                </span>
              </label>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-body">Model</span>
                <div className="flex gap-2">
                  <Select
                    ariaLabel="Model Gemini"
                    value={model}
                    onChange={setModel}
                    options={options}
                    className="flex-1"
                  />
                  <Button
                    variant="secondary"
                    onClick={loadModels}
                    disabled={modelsMutation.isPending}
                  >
                    {modelsMutation.isPending ? (
                      <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw aria-hidden className="h-4 w-4" />
                    )}
                    Muat model
                  </Button>
                </div>
                <span className="block text-[11px] text-body">
                  Sumber: {data?.source === "db" ? "pengaturan admin" : "env"}
                  {data?.updatedBy ? ` · diubah oleh ${data.updatedBy}` : ""}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={save} disabled={update.isPending}>
                {update.isPending && (
                  <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                )}
                Simpan
              </Button>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-primary underline"
              >
                Dapatkan API key
              </a>
            </div>

            {update.isError && (
              <p role="alert" className="text-sm text-danger">
                {message(update.error)}
              </p>
            )}

            <div className="rounded-lg bg-canvas-subtle p-3 text-xs text-body">
              API key disimpan terenkripsi (AES-256-GCM) dan tidak pernah
              ditampilkan kembali secara utuh.
            </div>
          </>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-hairline bg-surface p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-canvas-subtle text-primary">
            <PlugZap aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold text-ink">
              Test koneksi
            </h3>
            <p className="text-sm text-body">
              Kirim prompt sederhana untuk memastikan API key & model bekerja.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-body">Prompt</span>
          <textarea
            rows={3}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="w-full rounded-lg border border-hairline bg-canvas-subtle px-3 py-2 text-sm text-ink outline-none focus-visible:border-border-strong"
          />
        </div>

        <Button
          onClick={() =>
            testMutation.mutate(prompt, {
              onError: handleError,
            })
          }
          disabled={testMutation.isPending}
        >
          {testMutation.isPending && (
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          )}
          Test koneksi
        </Button>

        {testMutation.data && (
          <div className="space-y-2 rounded-lg border border-hairline bg-canvas-subtle p-4">
            <p className="text-xs font-semibold text-body">
              Output · {testMutation.data.data.model} ·{" "}
              {testMutation.data.data.latencyMs} ms
            </p>
            <pre className="whitespace-pre-wrap break-words text-sm text-ink">
              {testMutation.data.data.text}
            </pre>
          </div>
        )}

        {testMutation.isError && (
          <p role="alert" className="text-sm text-danger">
            {message(testMutation.error)}
          </p>
        )}
      </section>
    </div>
  );
}
