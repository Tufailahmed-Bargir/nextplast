import "server-only";

import QRCode from "qrcode";

export type QrKind =
  | "pickup"
  | "order"
  | "listing"
  | "collector-verification"
  | "referral";

/**
 * Lightweight QR generation for pickup / order / listing / verification / referral.
 * Scanning workflows are out of scope for Phase 10.
 */
export async function generateQrDataUrl(
  payload: string,
  options?: { width?: number; margin?: number },
): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: options?.margin ?? 2,
    width: options?.width ?? 256,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}

export function buildQrPayload(
  kind: QrKind,
  id: string,
  baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000",
): string {
  const root = baseUrl.replace(/\/$/, "");
  switch (kind) {
    case "pickup":
      return `${root}/collector/pickups/${id}`;
    case "order":
      return `${root}/orders/${id}`;
    case "listing":
      return `${root}/listings?id=${id}`;
    case "collector-verification":
      return `${root}/collector/pickups/${id}?verify=1`;
    case "referral":
      return `${root}/register?ref=${encodeURIComponent(id)}`;
    default:
      return `${root}/${id}`;
  }
}

export const QrService = {
  generateDataUrl: generateQrDataUrl,
  buildPayload: buildQrPayload,
};
