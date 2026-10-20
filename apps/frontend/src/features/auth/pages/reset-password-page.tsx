import { AuthLayout } from "../components/auth-layout";
import { ResetPasswordForm } from "../components/reset-password-form";

interface ResetPasswordPageProps {
  token: string;
}

export default function ResetPasswordPage({ token }: ResetPasswordPageProps) {
  return (
    <AuthLayout>
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
