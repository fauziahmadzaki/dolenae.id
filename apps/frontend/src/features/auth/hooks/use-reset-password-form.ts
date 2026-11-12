"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "~/components/ui/toaster";
import { resetPasswordAction } from "../api/password-reset";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "../types/password-reset-schema";

/** Reset-password form controller (token comes from the email link). */
export function useResetPasswordForm(token: string) {
  const { toast } = useToast();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ResetPasswordInput>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);

    const parsed = resetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "password" || field === "confirmPassword") {
          form.setError(field, { type: "server", message: issue.message });
        }
      }
      return;
    }

    const result = await resetPasswordAction({
      token,
      password: parsed.data.password,
      confirmPassword: parsed.data.confirmPassword,
    });

    if (!result.ok) {
      setServerError(result.message);
      toast({
        title: "Gagal menyimpan kata sandi",
        description: result.message,
        variant: "danger",
      });
      return;
    }

    setDone(true);
    toast({
      title: "Kata sandi diperbarui",
      description: result.message,
      variant: "success",
    });
  });

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    done,
    serverError,
  };
}
