import "server-only";

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { logger } from "@/utils/logger";

export type EmailTemplateId =
  | "welcome"
  | "password-reset"
  | "pickup-assigned"
  | "pickup-completed"
  | "coins-credited"
  | "order-confirmation"
  | "admin-notification";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM,
  );
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!smtpConfigured()) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

export function renderEmailTemplate(
  id: EmailTemplateId,
  vars: Record<string, string>,
): { subject: string; html: string; text: string } {
  const brand = "NexPlast";
  const name = vars.name ?? "there";
  const templates: Record<
    EmailTemplateId,
    { subject: string; body: string }
  > = {
    welcome: {
      subject: `Welcome to ${brand}`,
      body: `Hi ${name}, thanks for joining ${brand}. Start by uploading plastic photos for AI detection and earn Nature Coins.`,
    },
    "password-reset": {
      subject: `${brand} password reset`,
      body: `Hi ${name}, use this link to reset your password: ${vars.resetUrl ?? "#"}. It expires soon.`,
    },
    "pickup-assigned": {
      subject: `Pickup assigned — ${vars.pickupId ?? ""}`,
      body: `Hi ${name}, a collector has been assigned to your listing. Scheduled: ${vars.scheduledAt ?? "TBD"}.`,
    },
    "pickup-completed": {
      subject: `Pickup completed`,
      body: `Hi ${name}, your pickup is complete. Verified weight: ${vars.weight ?? "—"}.`,
    },
    "coins-credited": {
      subject: `Nature Coins credited`,
      body: `Hi ${name}, ${vars.amount ?? "0"} Nature Coins were added to your wallet.`,
    },
    "order-confirmation": {
      subject: `Order confirmed — ${vars.orderNumber ?? ""}`,
      body: `Hi ${name}, your order ${vars.orderNumber ?? ""} is confirmed. Total: ${vars.total ?? "—"}.`,
    },
    "admin-notification": {
      subject: vars.subject ?? `${brand} admin alert`,
      body: vars.body ?? "An admin event occurred.",
    },
  };

  const t = templates[id];
  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <h1 style="color:#059669;font-size:20px">${brand}</h1>
    <p>${t.body}</p>
    <p style="color:#64748b;font-size:12px">This is an automated message from ${brand}.</p>
  </div></body></html>`;
  return { subject: t.subject, html, text: t.body };
}

/**
 * Production-ready Nodemailer facade.
 * When SMTP is unset, logs the payload (dev/demo) instead of failing.
 */
export async function sendEmail(input: SendEmailInput): Promise<{
  delivered: boolean;
  mode: "smtp" | "log";
}> {
  const tx = getTransporter();
  if (!tx) {
    logger.info(
      "Email logged (SMTP not configured)",
      { to: input.to, subject: input.subject },
      "email",
    );
    return { delivered: false, mode: "log" };
  }

  await tx.sendMail({
    from: process.env.SMTP_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  return { delivered: true, mode: "smtp" };
}

export async function sendTemplatedEmail(
  id: EmailTemplateId,
  to: string,
  vars: Record<string, string>,
) {
  const rendered = renderEmailTemplate(id, vars);
  return sendEmail({
    to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

export const EmailService = {
  send: sendEmail,
  sendTemplate: sendTemplatedEmail,
  render: renderEmailTemplate,
  isConfigured: smtpConfigured,
};
