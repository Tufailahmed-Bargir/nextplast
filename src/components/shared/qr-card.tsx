import Image from "next/image";
import { buildQrPayload, generateQrDataUrl } from "@/services/qr/qr-service";

interface QrCardProps {
  kind: "pickup" | "order" | "listing" | "collector-verification" | "referral";
  id: string;
  label: string;
}

/** Server component — renders a QR data URL for demo handoff. */
export async function QrCard({ kind, id, label }: QrCardProps) {
  const payload = buildQrPayload(kind, id);
  const dataUrl = await generateQrDataUrl(payload, { width: 180 });

  return (
    <div className="inline-flex flex-col items-center gap-2 rounded-xl border border-border p-3">
      <Image src={dataUrl} alt={label} width={180} height={180} unoptimized />
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
