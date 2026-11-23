import { FeedbackForm } from "~/features/public/feedback-form";
import { PageHead, PublicShell } from "~/features/public/page-shell";

export const metadata = { title: "Kirim Masukan | Dolenae.id" };

export default function FeedbackPage() {
  return (
    <PublicShell>
      <PageHead title="Kirim Masukan" description="Bantu kami jadi lebih baik. Laporkan bug, kirim saran, atau usulkan konten baru." />
      <div className="mx-auto max-w-[768px] px-6 py-12 sm:py-[72px]">
        <FeedbackForm />
      </div>
    </PublicShell>
  );
}
