import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "~/features/auth/auth-context";
import { ApiError } from "~/lib/api";
import { Logo, SiteFooter } from "~/components/site-chrome";
import { MountainScene } from "~/components/mountain-scene";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const POINTS = [
  "Rekomendasi destinasi sesuai minat dan waktu",
  "Info akses, fasilitas, dan checklist lengkap",
  "Rencana perjalanan tersimpan rapi",
];

const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi").min(8, "Kata sandi minimal 8 karakter"),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"masuk" | "daftar">("masuk");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      void navigate({ to: "/admin" });
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Gagal masuk. Coba lagi.",
      );
    }
  });

  const isMasuk = tab === "masuk";

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Panel form */}
        <div className="flex w-full md:w-1/2">
          <div className="mx-auto flex w-full max-w-[720px] flex-col justify-center gap-4 px-6 py-8 md:px-[80px] md:py-10">
            <Logo />

            <div className="space-y-1">
              <h1 className="font-display text-[26px] font-extrabold leading-tight text-ink">
                {isMasuk ? "Masuk ke akunmu" : "Buat akun baru"}
              </h1>
              <p className="text-sm text-body">
                {isMasuk
                  ? "Lanjutkan menyiapkan perjalanan yang sudah kamu mulai."
                  : "Mulai rencanakan perjalanan alam pertamamu."}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex rounded-full border border-hairline bg-canvas-subtle p-[5px]">
              <button
                type="button"
                onClick={() => setTab("masuk")}
                className={
                  "flex-1 rounded-full py-2 text-sm font-semibold transition " +
                  (isMasuk ? "bg-primary text-on-primary" : "text-body hover:text-ink")
                }
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => setTab("daftar")}
                className={
                  "flex-1 rounded-full py-2 text-sm font-semibold transition " +
                  (!isMasuk ? "bg-primary text-on-primary" : "text-body hover:text-ink")
                }
              >
                Daftar
              </button>
            </div>

            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-medium text-body">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="dimas@dolenae.id"
                  aria-invalid={errors.email ? "true" : "false"}
                  className={
                    "h-11 w-full rounded-xl border bg-canvas-subtle px-4 text-sm text-ink outline-none placeholder:text-body/60 focus:border-border-strong " +
                    (errors.email ? "border-danger" : "border-hairline")
                  }
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-danger">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-medium text-body">
                  Kata sandi
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    aria-invalid={errors.password ? "true" : "false"}
                    className={
                      "h-11 w-full rounded-xl border bg-canvas-subtle px-4 pr-11 text-sm text-ink outline-none placeholder:text-body/60 focus:border-border-strong " +
                      (errors.password ? "border-danger" : "border-hairline")
                    }
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-body hover:text-ink"
                  >
                    <EyeIcon off={!showPassword} />
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-danger">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-body">
                  <span
                    className={
                      "flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border " +
                      "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-on-primary " +
                      "border-border-strong"
                    }
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <input type="checkbox" className="peer sr-only" {...register("remember")} />
                  Ingat saya
                </label>
                <Link to="/login" className="text-sm font-medium text-primary hover:underline">
                  Lupa kata sandi?
                </Link>
              </div>

              {formError && (
                <p className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm text-danger">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-full bg-primary text-sm font-semibold text-on-primary transition hover:bg-primary-hover disabled:opacity-60"
              >
                {isSubmitting ? "Memproses..." : isMasuk ? "Masuk" : "Daftar"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-hairline" />
              <span className="text-xs text-body">atau lanjut dengan</span>
              <span className="h-px flex-1 bg-hairline" />
            </div>

            <button
              type="button"
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border-strong bg-surface text-sm font-medium text-ink transition hover:bg-canvas-subtle"
            >
              <GoogleIcon />
              Google
            </button>

            <p className="text-center text-sm text-body">
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => setTab("daftar")}
                className="font-medium text-primary hover:underline"
              >
                Daftar sekarang
              </button>
            </p>
          </div>
        </div>

        {/* Panel media */}
        <div className="relative hidden w-full flex-col justify-center gap-3 bg-primary px-6 py-10 text-on-primary md:flex md:w-1/2 md:px-[80px]">
          <div className="mx-auto flex w-full max-w-[520px] flex-col gap-3">
            <MountainScene className="h-[110px] w-[110px]" />
            <h2 className="font-display text-[24px] font-bold">
              Discover More, Prepare Better
            </h2>
            <p className="text-sm text-canvas">
              Semua kebutuhan perjalanan alam Indonesia dalam satu tempat.
            </p>
            <ul className="mt-1 space-y-2">
              {POINTS.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-hover">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-sm text-canvas">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function EyeIcon({ off }: Readonly<{ off: boolean }>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      {off ? (
        <>
          <path d="M10.7 5.1A10.9 10.9 0 0 1 12 5c7 0 10 7 10 7a18.5 18.5 0 0 1-3 4" />
          <path d="M6.6 6.6A18.5 18.5 0 0 0 2 12s3 7 10 7a10.9 10.9 0 0 0 5-1.2" />
          <path d="m2 2 20 20" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </>
      ) : (
        <>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.35 11.1H12v2.98h5.35c-.23 1.5-1.7 4.4-5.35 4.4-3.22 0-5.85-2.66-5.85-5.94S8.78 6.6 12 6.6c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.66 4.02 14.54 3.1 12 3.1 6.98 3.1 2.9 7.18 2.9 12.2S6.98 21.3 12 21.3c5.29 0 8.8-3.72 8.8-8.95 0-.6-.06-1.05-.15-1.5Z"
      />
    </svg>
  );
}
