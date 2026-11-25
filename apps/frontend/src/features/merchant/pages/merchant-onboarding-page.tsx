"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/toaster";
import {
  resendVerificationEmail,
  updateMe,
} from "~/features/auth/api/profile";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { cn } from "~/lib/cn";
import { useMerchantOnboarding } from "../hooks/use-merchant-onboarding";

const WIZARD_STEPS = [
  { number: 1, label: "Profil Usaha" },
  { number: 2, label: "Verifikasi Email" },
  { number: 3, label: "Fasilitas Pertama" },
] as const;

const PREPARATION_TIPS = [
  {
    icon: Building2,
    title: "Pilih destinasi terdekat",
    description: "Tautkan usaha Anda ke destinasi alam yang relevan.",
  },
  {
    icon: MapPin,
    title: "Pin lokasi (maks. 20 km)",
    description: "Tandai titik usaha di peta dalam radius 20 km dari destinasi.",
  },
  {
    icon: Camera,
    title: "Siapkan foto & kontak",
    description: "Unggah 1 foto banner yang jelas dan cantumkan kontak aktif.",
  },
] as const;

export function MerchantOnboardingPage() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const onboarding = useMerchantOnboarding();

  const initialStepParam = Number(searchParams.get("step"));
  const [step, setStep] = useState<number>(
    initialStepParam >= 1 && initialStepParam <= 3 ? initialStepParam : 1,
  );

  // Step 1 form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [formInitialized, setFormInitialized] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<{
    name?: string;
    phone?: string;
    city?: string;
  }>({});

  // Step 2 verification state
  const [resending, setResending] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!auth.user || formInitialized) return;
    setName(auth.user.name ?? "");
    setPhone(auth.user.phone ?? "");
    setCity(auth.user.city ?? "");
    setBio(auth.user.bio ?? "");
    setFormInitialized(true);
  }, [auth.user, formInitialized]);

  useEffect(() => {
    const paramStep = Number(searchParams.get("step"));
    if (paramStep >= 1 && paramStep <= 3) {
      setStep(paramStep);
    }
  }, [searchParams]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.token) return;

    const nextErrors: typeof profileErrors = {};
    if (name.trim().length < 2) {
      nextErrors.name = "Nama pengelola atau usaha minimal 2 karakter.";
    }
    if (phone.trim().length < 8) {
      nextErrors.phone = "Masukkan nomor WhatsApp/telepon yang valid.";
    }
    if (city.trim().length < 2) {
      nextErrors.city = "Kota atau kabupaten wajib diisi.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setProfileErrors(nextErrors);
      return;
    }

    setProfileErrors({});
    setSavingProfile(true);
    try {
      const updated = await updateMe(
        {
          name: name.trim(),
          phone: phone.trim(),
          city: city.trim(),
          bio: bio.trim() ? bio.trim() : null,
        },
        auth.token,
      );
      auth.updateUser(updated);
      toast({
        title: "Profil disimpan",
        description: "Data kontak usaha Anda berhasil diperbarui.",
        variant: "success",
      });
      setStep(2);
    } catch (error) {
      toast({
        title: "Gagal menyimpan profil",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan. Silakan coba lagi.",
        variant: "danger",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.user?.email || resending || cooldown > 0) return;
    setResending(true);
    try {
      const res = await resendVerificationEmail(auth.user.email);
      toast({
        title: "Tautan verifikasi dikirim",
        description:
          res.message || "Periksa kotak masuk atau folder spam email Anda.",
        variant: "success",
      });
      setCooldown(60);
    } catch (error) {
      toast({
        title: "Gagal mengirim email",
        description:
          error instanceof Error
            ? error.message
            : "Tunggu sebentar sebelum mencoba lagi.",
        variant: "danger",
      });
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (checkingVerification) return;
    setCheckingVerification(true);
    try {
      const freshUser = await onboarding.refreshMe();
      if (freshUser?.emailVerifiedAt) {
        toast({
          title: "Email terverifikasi",
          description: "Terima kasih, alamat email Anda sudah terkonfirmasi.",
          variant: "success",
        });
        setStep(3);
      } else {
        toast({
          title: "Belum terverifikasi",
          description:
            "Email Anda masih menunggu konfirmasi. Silakan klik tautan di email Anda.",
          variant: "info",
        });
      }
    } catch (error) {
      toast({
        title: "Gagal memeriksa status",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan. Silakan coba lagi.",
        variant: "danger",
      });
    } finally {
      setCheckingVerification(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Selamat datang di Dolenae Merchant
          </h1>
          <p className="text-sm text-body">
            Selesaikan 3 langkah singkat ini agar usaha Anda siap tayang ke
            wisatawan.
          </p>
        </div>
        <Link
          href="/merchant"
          className="text-xs font-semibold text-body hover:text-ink hover:underline"
        >
          Lewati ke dashboard
        </Link>
      </div>

      {/* Stepper */}
      <nav
        aria-label="Langkah onboarding"
        className="grid grid-cols-3 gap-2 rounded-xl border border-hairline bg-surface p-2"
      >
        {WIZARD_STEPS.map((item) => {
          const active = step === item.number;
          const done =
            (item.number === 1 && onboarding.profileCompleted) ||
            (item.number === 2 && onboarding.emailVerified) ||
            (item.number === 3 && onboarding.hasFacility);
          return (
            <button
              key={item.number}
              type="button"
              onClick={() => setStep(item.number)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition-colors",
                active
                  ? "bg-primary text-on-primary"
                  : "text-body hover:bg-canvas-subtle hover:text-ink",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px]",
                  active
                    ? "bg-on-primary text-primary"
                    : done
                      ? "bg-success/15 text-success"
                      : "bg-canvas-subtle text-body",
                )}
              >
                {done && !active ? (
                  <Check className="h-3 w-3" />
                ) : (
                  item.number
                )}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Step 1: Profil & Kontak Usaha */}
      {step === 1 && (
        <section className="rounded-2xl border border-hairline bg-surface p-6">
          <div className="mb-5 space-y-1">
            <h2 className="font-display text-lg font-bold text-ink">
              1. Lengkapi profil &amp; kontak usaha
            </h2>
            <p className="text-sm text-body">
              Informasi ini memudahkan tim verifikasi Dolenae menghubungi Anda
              bila ada data fasilitas yang perlu dikonfirmasi.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="onboarding-name"
                className="block text-xs font-semibold text-body"
              >
                Nama pengelola / usaha
              </label>
              <Input
                id="onboarding-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Homestay Cemoro Indah"
                disabled={savingProfile}
                aria-invalid={profileErrors.name ? true : undefined}
              />
              {profileErrors.name && (
                <p role="alert" className="text-xs text-danger">
                  {profileErrors.name}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="onboarding-phone"
                  className="block text-xs font-semibold text-body"
                >
                  Nomor WhatsApp / Telepon
                </label>
                <Input
                  id="onboarding-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  disabled={savingProfile}
                  aria-invalid={profileErrors.phone ? true : undefined}
                />
                {profileErrors.phone && (
                  <p role="alert" className="text-xs text-danger">
                    {profileErrors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="onboarding-city"
                  className="block text-xs font-semibold text-body"
                >
                  Kota / Kabupaten
                </label>
                <Input
                  id="onboarding-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Contoh: Wonosobo"
                  disabled={savingProfile}
                  aria-invalid={profileErrors.city ? true : undefined}
                />
                {profileErrors.city && (
                  <p role="alert" className="text-xs text-danger">
                    {profileErrors.city}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="onboarding-bio"
                className="block text-xs font-semibold text-body"
              >
                Deskripsi singkat usaha (opsional)
              </label>
              <textarea
                id="onboarding-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ceritakan singkat layanan atau pengalaman usaha Anda di sekitar destinasi."
                disabled={savingProfile}
                maxLength={1000}
                className="min-h-24 w-full rounded-lg border border-hairline bg-canvas-subtle px-3.5 py-3 text-sm text-ink focus-visible:border-border-strong focus-visible:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(2)}
                disabled={savingProfile}
              >
                Lewati langkah ini
              </Button>
              <Button type="submit" disabled={savingProfile} className="gap-1.5">
                {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                Simpan &amp; lanjut
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* Step 2: Verifikasi Email */}
      {step === 2 && (
        <section className="rounded-2xl border border-hairline bg-surface p-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="font-display text-lg font-bold text-ink">
                  2. Verifikasi alamat email
                </h2>
                <p className="text-sm text-body">
                  Kami mengirimkan tautan konfirmasi ke{" "}
                  <span className="font-semibold text-ink">
                    {auth.user?.email}
                  </span>
                  .
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                  onboarding.emailVerified
                    ? "bg-success/15 text-success"
                    : "bg-warning/15 text-warning",
                )}
              >
                {onboarding.emailVerified ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Terverifikasi
                  </>
                ) : (
                  <>
                    <Mail className="h-3.5 w-3.5" /> Menunggu verifikasi
                  </>
                )}
              </span>
            </div>

            {onboarding.emailVerified ? (
              <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-sm text-ink">
                Email Anda sudah terverifikasi. Anda siap mendaftarkan fasilitas
                pertama Anda.
              </div>
            ) : (
              <div className="space-y-4 rounded-xl border border-hairline bg-canvas-subtle p-4">
                <p className="text-sm text-body">
                  Buka email dari Dolenae dan klik tautan verifikasi. Jika belum
                  masuk, periksa folder spam atau kirim ulang tautan di bawah.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleResendVerification}
                    disabled={resending || cooldown > 0}
                    className="gap-1.5"
                  >
                    {resending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {cooldown > 0
                      ? `Kirim ulang (${cooldown}d)`
                      : "Kirim ulang email verifikasi"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCheckVerification}
                    disabled={checkingVerification}
                    className="gap-1.5"
                  >
                    {checkingVerification ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Saya sudah verifikasi
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
                className="gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Kembali
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                className="gap-1.5"
              >
                {onboarding.emailVerified
                  ? "Lanjut"
                  : "Verifikasi nanti, lanjut"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Step 3: Daftarkan Fasilitas Pertama */}
      {step === 3 && (
        <section className="rounded-2xl border border-hairline bg-surface p-6">
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-ink">
                3. Daftarkan fasilitas pertama Anda
              </h2>
              <p className="text-sm text-body">
                Setelah fasilitas terdaftar, Anda dapat langsung menambahkan
                daftar produk atau layanan (kamar, sewa jeep, menu warung).
              </p>
            </div>

            {onboarding.hasFacility ? (
              <div className="rounded-xl border border-success/30 bg-success/5 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Fasilitas pertama sudah terdaftar!
                      </p>
                      <p className="text-xs text-body">
                        Anda sudah memiliki {onboarding.facilities.length}{" "}
                        fasilitas. Lanjutkan menambahkan produk atau pantau
                        statusnya di dashboard.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {onboarding.firstFacilityId && (
                        <Button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/merchant/fasilitas/${onboarding.firstFacilityId}/produk`,
                            )
                          }
                        >
                          Kelola produk fasilitas
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => router.push("/merchant")}
                      >
                        Buka dashboard
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  {PREPARATION_TIPS.map((tip) => {
                    const Icon = tip.icon;
                    return (
                      <div
                        key={tip.title}
                        className="rounded-xl border border-hairline bg-canvas-subtle p-4"
                      >
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                        <h3 className="mt-3 text-sm font-semibold text-ink">
                          {tip.title}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-body">
                          {tip.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(2)}
                    className="gap-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" /> Kembali
                  </Button>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => router.push("/merchant")}
                    >
                      Buka dashboard
                    </Button>
                    <Button
                      type="button"
                      onClick={() => router.push("/merchant/fasilitas/baru")}
                      className="gap-1.5"
                    >
                      Daftarkan fasilitas pertama
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
