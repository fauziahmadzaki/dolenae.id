import { AuthLayout } from "../components/auth-layout";
import { VerifyEmailPanel } from "../components/verify-email-panel";

interface VerifyEmailPageProps {
  token: string;
}

export default function VerifyEmailPage({ token }: VerifyEmailPageProps) {
  return (
    <AuthLayout>
      <VerifyEmailPanel token={token} />
    </AuthLayout>
  );
}
