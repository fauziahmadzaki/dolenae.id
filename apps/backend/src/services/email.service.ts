import { Resend } from "resend";
import { loadEnv } from "../config/env";
import { InternalError } from "../utils/errors";

let client: Resend | null = null;

/** Lazily create the Resend client; returns null in dev without an API key. */
function getClient(): Resend | null {
  const { RESEND_API_KEY } = loadEnv();
  if (!RESEND_API_KEY) return null;
  client ??= new Resend(RESEND_API_KEY);
  return client;
}

/**
 * Send the password-reset email. Without `RESEND_API_KEY` (dev/test) the
 * message is logged to the console instead of being sent.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  const { MAIL_FROM } = loadEnv();
  const subject = "Reset Password Dolenae.id";
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#1f5136">Reset Password</h2>
      <p>Kami menerima permintaan untuk mengatur ulang password akun Dolenae.id kamu.</p>
      <p>Klik tautan berikut untuk membuat password baru:</p>
      <p><a href="${resetUrl}" style="color:#1f5136">${resetUrl}</a></p>
      <p>Tautan ini berlaku terbatas. Abaikan email ini jika kamu tidak meminta reset password.</p>
    </div>
  `.trim();

  const resend = getClient();
  if (!resend) {
    console.info(`[email] (dev) password reset for ${to}: ${resetUrl}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: MAIL_FROM,
    to,
    subject,
    html,
  });

  if (error) {
    throw new InternalError("Gagal mengirim email reset password", error);
  }
}
