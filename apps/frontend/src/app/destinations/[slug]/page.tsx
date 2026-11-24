import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicShell } from "~/features/public/page-shell";
import { DestinationDetailPage } from "~/features/public-destinations/detail-page";
import { getDestinationBySlug } from "~/features/public-destinations/server";

// Detail selalu diambil saat request agar build tidak bergantung pada API.
export const dynamic = "force-dynamic";

interface DestinationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: DestinationPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await getDestinationBySlug(slug);
    const description =
      data.tagline ??
      data.description?.slice(0, 155) ??
      `Informasi destinasi ${data.name} di Dolenae.id.`;

    return {
      title: `${data.name} | Dolenae.id`,
      description,
      openGraph: {
        title: `${data.name} | Dolenae.id`,
        description,
        images: data.images.length > 0 ? [data.images[0]] : undefined,
      },
    };
  } catch {
    return { title: "Destinasi | Dolenae.id" };
  }
}

export default async function DestinationPage({
  params,
}: DestinationPageProps) {
  const { slug } = await params;
  try {
    const { data } = await getDestinationBySlug(slug);
    return (
      <PublicShell>
        <DestinationDetailPage destination={data} />
      </PublicShell>
    );
  } catch {
    notFound();
  }
}
