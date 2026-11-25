"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Mail, RefreshCw } from "lucide-react";
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

export function MerchantProfilePage() {
  const auth = useAuth();
  const { toast } = useToast();
  const onboarding = useMerchantOnboarding();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!auth.user || initialized) return;
    setName(auth.user.name ?? "");
    setPhone(auth.user.phone ?? "");
    setCity(auth.user.city ?? "");
    setBio(auth.user.bio ?? "");
    setInitialized(true);
  }, [auth.user, initialized]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.token) return;
    if (name.trim().length < 2) {
      toast({
        title: "Nama tidak valid",
        description: "Nama pengelola atau usaha minimal 2 karakter.",
        variant: "danger",
      });
      return;
    }

    setSaving(true);
    try {
      const updated = await updateMe(
        {
          name: name.trim(),
          phone: phone.trim() ? phone.trim() : null,
          city: city.trim() ? city.trim() : null,
          bio: bio.trim() ? bio.trim() : null,
        },
        auth.token,
      );
      auth.updateUser(updated);
      toast({
        title: "Profil diperbarui",
        description: "Perubahan profil merchant Anda telah disimpan.",
        variant: "success",
      });
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
      setSaving(false);
    }
  };

  const handleResend = async () => {
    if (!auth.user?.email || resending || cooldown > 0) return;
    setResending(true);
    try {
      const res = await resendVerificationEmail(auth.user.email);
      toast({
        title: "Email verifikasi dikirim",
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

  const handleCheck = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const freshUser = await onboarding.refreshMe();
      toast({
        title: freshUser?.emailVerifiedAt
          ? "Email sudah terverifikasi"
          : "Belum terverifikasi",
        description: freshUser?.emailVerifiedAt
          ? "Status verifikasi email Anda telah diperbarui."
          : "Silakan buka tautan verifikasi yang dikirim ke email Anda.",
        variant: freshUser?.emailVerifiedAt ? "success" : "info",
      });
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
      setChecking(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Profil merchant
          </h1>
          <p className="text-sm text-body">
            Kelola identitas pengelola, kontak aktif, dan status verifikasi
            akun.
          </p>
        </div>
        {!onboarding.isComplete && (
          <Link
            href="/merchant/onboarding"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Lanjutkan panduan onboarding →
          </Link>
        )}
      </div>

      {/* Status Verifikasi Email */}
      <section className="rounded-xl border border-hairline bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-body">Alamat email</p>
            <p className="text-sm font-semibold text-ink">
              {auth.user?.email ?? "—"}
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

        {!onboarding.emailVerified && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-hairline pt-4">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="gap-1.5"
            >
              {resending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {cooldown > 0
                ? `Kirim ulang (${cooldown}d)`
                : "Kirim ulang email verifikasi"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleCheck}
              disabled={checking}
              className="gap-1.5"
            >
              {checking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Cek status
            </Button>
          </div>
        )}
      </section>

      {/* Form Profil */}
      <section className="rounded-xl border border-hairline bg-surface p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="profile-name"
              className="block text-xs font-semibold text-body"
            >
              Nama pengelola / usaha
            </label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="profile-phone"
                className="block text-xs font-semibold text-body"
              >
                Nomor WhatsApp / Telepon
              </label>
              <Input
                id="profile-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812xxxxxxxx"
                disabled={saving}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="profile-city"
                className="block text-xs font-semibold text-body"
              >
                Kota / Kabupaten
              </label>
              <Input
                id="profile-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Wonosobo"
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-bio"
              className="block text-xs font-semibold text-body"
            >
              Deskripsi singkat usaha
            </label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={saving}
              maxLength={1000}
              className="min-h-24 w-full rounded-lg border border-hairline bg-canvas-subtle px-3.5 py-3 text-sm text-ink focus-visible:border-border-strong focus-visible:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan perubahan
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
