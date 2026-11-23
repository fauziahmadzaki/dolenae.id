"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getMe } from "~/features/auth/api/profile";
import { useAuth } from "~/features/auth/hooks/use-auth";
import type { AuthUser } from "~/features/auth/types";
import {
  useMyFacilities,
  useMyProducts,
} from "~/features/facilities/hooks/use-facilities";

export interface OnboardingStepItem {
  key: "profile" | "email" | "facility" | "product";
  title: string;
  description: string;
  completed: boolean;
  href: string;
  ctaLabel: string;
}

function dismissedStorageKey(userId: string) {
  return `dolenae.merchant.onboarding.dismissed.${userId}`;
}

export function useMerchantOnboarding() {
  const auth = useAuth();
  const enabled =
    auth.hydrated && !!auth.token && auth.user?.role === "merchant";

  const facilities = useMyFacilities({ limit: 100 }, auth.token, enabled);
  const products = useMyProducts({ limit: 1 }, auth.token, enabled);

  const [dismissed, setDismissed] = useState(false);

  const userId = auth.user?.id;
  useEffect(() => {
    if (!userId || typeof window === "undefined") return;
    setDismissed(
      window.localStorage.getItem(dismissedStorageKey(userId)) === "1",
    );
  }, [userId]);

  const dismiss = useCallback(() => {
    if (userId && typeof window !== "undefined") {
      window.localStorage.setItem(dismissedStorageKey(userId), "1");
    }
    setDismissed(true);
  }, [userId]);

  const refreshMe = useCallback(async (): Promise<AuthUser | null> => {
    if (!auth.token) return null;
    const freshUser = await getMe(auth.token);
    auth.updateUser(freshUser);
    return freshUser;
  }, [auth]);

  const facilityItems = facilities.data?.data ?? [];
  const firstFacilityId = facilityItems[0]?.id ?? null;
  const productTotal = Number(products.data?.meta?.total ?? 0);

  const profileCompleted = Boolean(
    auth.user?.phone?.trim() && auth.user?.city?.trim(),
  );
  const emailVerified = Boolean(auth.user?.emailVerifiedAt);
  const hasFacility = facilityItems.length > 0;
  const hasProduct = productTotal > 0;

  const steps: OnboardingStepItem[] = useMemo(
    () => [
      {
        key: "profile",
        title: "Lengkapi profil & kontak usaha",
        description:
          "Isi nomor WhatsApp aktif dan kota domisili agar mudah dihubungi.",
        completed: profileCompleted,
        href: "/merchant/onboarding?step=1",
        ctaLabel: "Lengkapi",
      },
      {
        key: "email",
        title: "Verifikasi alamat email",
        description:
          "Konfirmasi email Anda untuk keamanan akun dan notifikasi moderasi.",
        completed: emailVerified,
        href: "/merchant/onboarding?step=2",
        ctaLabel: "Verifikasi",
      },
      {
        key: "facility",
        title: "Daftarkan fasilitas pertama",
        description:
          "Tambahkan penginapan, transportasi, atau warung di sekitar destinasi.",
        completed: hasFacility,
        href: "/merchant/fasilitas/baru",
        ctaLabel: "Daftarkan",
      },
      {
        key: "product",
        title: "Tambahkan produk atau layanan",
        description:
          "Lengkapi daftar kamar, paket jeep, atau menu agar wisatawan tahu tarifnya.",
        completed: hasProduct,
        href: firstFacilityId
          ? `/merchant/fasilitas/${firstFacilityId}/produk`
          : "/merchant/fasilitas/baru",
        ctaLabel: hasFacility ? "Tambah produk" : "Daftarkan fasilitas",
      },
    ],
    [
      profileCompleted,
      emailVerified,
      hasFacility,
      hasProduct,
      firstFacilityId,
    ],
  );

  const completedCount = steps.filter((step) => step.completed).length;
  const totalCount = steps.length;
  const percent = Math.round((completedCount / totalCount) * 100);
  const isComplete = completedCount === totalCount;

  const pendingCount = facilityItems.filter(
    (item) => item.status === "pending",
  ).length;
  const publishedCount = facilityItems.filter(
    (item) => item.status === "published",
  ).length;
  const rejectedCount = facilityItems.filter(
    (item) => item.status === "rejected",
  ).length;

  return {
    steps,
    profileCompleted,
    emailVerified,
    hasFacility,
    hasProduct,
    completedCount,
    totalCount,
    percent,
    isComplete,
    dismissed,
    dismiss,
    refreshMe,
    facilities: facilityItems,
    firstFacilityId,
    pendingCount,
    publishedCount,
    rejectedCount,
    isLoading: facilities.isLoading || products.isLoading,
  };
}
