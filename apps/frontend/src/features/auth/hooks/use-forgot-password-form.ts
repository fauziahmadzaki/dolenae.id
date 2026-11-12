"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "~/components/ui/toaster";
import { forgotPasswordAction } from "../api/password-reset";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "../types/password-reset-schema";

/**
 * Forgot-password form controller: validation + server action live here so the
 * component stays presentational.
 */
export function useForgotPasswordForm() {
  const { toast } = useToast();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<ForgotPasswordInput>({
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const parsed = forgotPasswordSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "email") {
          form.setError("email", { type: "server", message: issue.message });
        }
      }
      return;
    }

    const result = await forgotPasswordAction(parsed.data);
    if (!result.ok) {
      if (result.fieldErrors?.email) {
        form.setError("email", {
          type: "server",
          message: result.fieldErrors.email,
        });
      }
      toast({
        title: "Gagal mengirim tautan",
        description: result.message,
        variant: "danger",
      });
      return;
    }

    setSentTo(parsed.data.email);
    toast({
      title: "Tautan dikirim",
      description: result.message,
      variant: "success",
    });
  });

  const restart = () => {
    setSentTo(null);
    form.reset();
  };

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    sentTo,
    restart,
  };
}
