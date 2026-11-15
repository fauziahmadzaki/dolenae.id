"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useToast } from "~/components/ui/toaster";
import type { ZodError } from "zod";
import { registerAction } from "../api/register";
import { useAuth } from "./use-auth";
import { registerSchema, type RegisterInput } from "../types/register-schema";

function zodFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const name = String(issue.path[0] ?? "root");
    if (!fieldErrors[name]) fieldErrors[name] = issue.message;
  }
  return fieldErrors;
}

/**
 * Merchant registration controller: validation, server action, session wiring
 * and redirect to the merchant dashboard after a successful sign-up.
 */
export function useRegisterForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<RegisterInput>({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const applyFieldErrors = (fieldErrors?: Record<string, string>) => {
    if (!fieldErrors) return;
    for (const [name, message] of Object.entries(fieldErrors)) {
      form.setError(name as keyof RegisterInput, { type: "server", message });
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      applyFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    const result = await registerAction(parsed.data);
    if (!result.ok) {
      applyFieldErrors(result.fieldErrors);
      toast({
        title: "Gagal mendaftar",
        description: result.message,
        variant: "danger",
      });
      return;
    }

    login(result.data, true);
    toast({
      title: "Akun merchant dibuat",
      description:
        "Kami mengirim tautan verifikasi ke email Anda. Anda bisa langsung mendaftarkan fasilitas.",
      variant: "success",
    });
    router.replace("/merchant");
  });

  return { form, onSubmit, isSubmitting: form.formState.isSubmitting };
}
