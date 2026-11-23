import { Suspense } from "react";
import { MerchantOnboardingPage } from "~/features/merchant/pages/merchant-onboarding-page";

export default function MerchantOnboardingRoute() {
  return (
    <Suspense>
      <MerchantOnboardingPage />
    </Suspense>
  );
}
