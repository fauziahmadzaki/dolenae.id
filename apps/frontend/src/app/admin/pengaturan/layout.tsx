import { AdminSettingsLayout } from "~/features/settings/admin-settings-layout";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AdminSettingsLayout>{children}</AdminSettingsLayout>;
}
