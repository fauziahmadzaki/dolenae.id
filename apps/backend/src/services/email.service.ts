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

interface Delivery {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Line printed instead of sending when no API key is configured. */
  devHint: string;
  /** Message attached to the error when Resend rejects the request. */
  failureMessage: string;
}

/**
 * Send one transactional email. Without `RESEND_API_KEY` (dev/test) the
 * message is logged to the console instead of being sent.
 */
async function deliver({
  to,
  subject,
  html,
  text,
  devHint,
  failureMessage,
}: Delivery): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.info(`[email] (dev) ${devHint}`);
    return;
  }

  const { MAIL_FROM, MAIL_REPLY_TO } = loadEnv();
  const { error } = await resend.emails.send({
    from: MAIL_FROM,
    to,
    subject,
    html,
    text,
    ...(MAIL_REPLY_TO ? { replyTo: MAIL_REPLY_TO } : {}),
  });

  if (error) throw new InternalError(failureMessage, error);
}

const FONT = "Arial,Helvetica,sans-serif";
const INK = "#17211b";
const BODY = "#4a5149";
const MUTED = "#7c8a7e";
const PRIMARY = "#1e3b2e";

interface EmailContent {
  title: string;
  /** Body paragraphs as HTML. */
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  /** Small print above the footer (e.g. "ignore this email"). */
  note: string;
}

/**
 * Table-based, inline-styled layout so the CTA renders as a button in Gmail,
 * Outlook and Apple Mail (email clients strip `<style>` blocks).
 */
function renderHtml({
  title,
  body,
  ctaLabel,
  ctaUrl,
  note,
}: EmailContent): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f1e9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f1e9;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;">
          <tr>
            <td style="padding:32px 28px 0 28px;font-family:${FONT};font-size:15px;font-weight:700;color:${PRIMARY};">
              Dolenae.id
            </td>
          </tr>
          <tr>
            <td style="padding:12px 28px 0 28px;">
              <h1 style="margin:0;font-family:${FONT};font-size:22px;line-height:1.3;color:${INK};">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 28px 0 28px;font-family:${FONT};font-size:15px;line-height:1.6;color:${BODY};">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 0 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="${PRIMARY}" style="border-radius:9999px;">
                    <a href="${ctaUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:15px;font-weight:700;line-height:1;color:#ffffff;text-decoration:none;border-radius:9999px;">${ctaLabel}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 0 28px;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED};">
              <p style="margin:0 0 6px 0;">Tombol tidak berfungsi? Salin tautan berikut ke browser:</p>
              <p style="margin:0;word-break:break-all;">
                <a href="${ctaUrl}" target="_blank" rel="noopener" style="color:${PRIMARY};">${ctaUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 32px 28px;font-family:${FONT};font-size:12px;line-height:1.6;color:${BODY};">
              ${note}
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0 0;font-family:${FONT};font-size:11px;color:${MUTED};">
          © 2026 Dolenae.id — Discover More, Prepare Better.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderText(
  title: string,
  intro: string,
  ctaLabel: string,
  url: string,
  note: string,
): string {
  return [
    title,
    "",
    intro,
    "",
    `${ctaLabel}: ${url}`,
    "",
    note,
    "",
    "© 2026 Dolenae.id",
  ].join("\n");
}

/** Send the password-reset email. */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  const title = "Atur ulang kata sandi";
  const intro =
    "Kami menerima permintaan untuk mengatur ulang kata sandi akun Dolenae.id kamu. Klik tombol berikut untuk membuat kata sandi baru.";
  const ctaLabel = "Buat kata sandi baru";
  const note = `Tautan ini berlaku selama ${loadEnv().PASSWORD_RESET_TTL_MINUTES} menit. Abaikan email ini jika kamu tidak meminta reset password.`;

  await deliver({
    to,
    subject: "Reset Password Dolenae.id",
    html: renderHtml({
      title,
      body: `<p style="margin:0;">${intro}</p>`,
      ctaLabel,
      ctaUrl: resetUrl,
      note,
    }),
    text: renderText(title, intro, ctaLabel, resetUrl, note),
    devHint: `password reset for ${to}: ${resetUrl}`,
    failureMessage: "Gagal mengirim email reset password",
  });
}

/** Send the email-verification link (soft verification, no expiry). */
export async function sendVerificationEmail(
  to: string,
  verifyUrl: string,
): Promise<void> {
  const title = "Verifikasi email kamu";
  const intro =
    "Terima kasih sudah mendaftar di Dolenae.id. Klik tombol berikut untuk memverifikasi alamat email kamu dan memastikan notifikasi penting sampai ke inbox.";
  const ctaLabel = "Verifikasi email";
  const note =
    "Tautan ini tidak kedaluwarsa. Abaikan email ini jika kamu tidak membuat akun Dolenae.id.";

  await deliver({
    to,
    subject: "Verifikasi Email Dolenae.id",
    html: renderHtml({
      title,
      body: `<p style="margin:0;">${intro}</p>`,
      ctaLabel,
      ctaUrl: verifyUrl,
      note,
    }),
    text: renderText(title, intro, ctaLabel, verifyUrl, note),
    devHint: `verify email for ${to}: ${verifyUrl}`,
    failureMessage: "Gagal mengirim email verifikasi",
  });
}
