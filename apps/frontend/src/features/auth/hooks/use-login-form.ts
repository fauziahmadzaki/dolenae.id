"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useToast } from "~/components/ui/toaster";
import type { ZodError } from "zod";
import { loginAction } from "../api/login";
import { useAuth } from "./use-auth";
import { loginSchema, type LoginInput } from "../types/login-schema";

function zodFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const name = String(issue.path[0] ?? "root");
    if (!fieldErrors[name]) fieldErrors[name] = issue.message;
  }
  return fieldErrors;
}

/**
 * Login form controller — validation (zod), submit to the server action and
 * session wiring live here so the components stay presentational.
 */
export function useLoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoginInput>({
    defaultValues: { email: "", password: "", remember: true },
  });

  const applyFieldErrors = (fieldErrors?: Record<string, string>) => {
    if (!fieldErrors) return;
    for (const [name, message] of Object.entries(fieldErrors)) {
      form.setError(name as keyof LoginInput, { type: "server", message });
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      applyFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    const result = await loginAction(parsed.data);
    if (!result.ok) {
      applyFieldErrors(result.fieldErrors);
      toast({
        title: "Gagal masuk",
        description: result.message,
        variant: "danger",
      });
      return;
    }

    login(result.data, parsed.data.remember);
    toast({
      title: "Berhasil masuk",
      description: `Selamat datang, ${result.data.user.name}!`,
      variant: "success",
    });
    router.push("/admin");
  });

  return { form, onSubmit, isSubmitting: form.formState.isSubmitting };
}