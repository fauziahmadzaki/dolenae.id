import type { ReactNode } from "react";
import { MerchantShell } from "~/features/merchant/components/merchant-shell";

export default function MerchantLayout({ children }: { children: ReactNode }) {
  return <MerchantShell>{children}</MerchantShell>;
}
