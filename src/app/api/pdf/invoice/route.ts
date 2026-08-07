import {
  AuthHttpError,
  requireAuth,
  assertOwnership,
} from "@/features/auth/services/guards";
import { prisma } from "@/prisma";
import { buildSimplePdf, pdfResponse } from "@/services/pdf/pdf-service";
import {
  apiForbidden,
  apiNotFound,
  apiServerError,
  apiUnauthorized,
} from "@/utils/api-response";

/**
 * GET /api/pdf/invoice?orderId=...
 */
export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const orderId = new URL(request.url).searchParams.get("orderId");
    if (!orderId) return apiNotFound("orderId required");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { name: true, email: true } } },
    });
    if (!order) return apiNotFound("Order not found");
    assertOwnership(user, order.userId);

    const bytes = await buildSimplePdf({
      title: "Order Invoice",
      subtitle: `Order ${order.id}`,
      sections: [
        {
          title: "Customer",
          lines: [
            order.user.name ?? "Customer",
            order.user.email,
            `Status: ${order.status}`,
            `Payment: ${order.paymentMode}`,
          ],
        },
        {
          title: "Totals",
          lines: [
            `Cash INR: ${Number(order.cashAmountInr).toFixed(2)}`,
            `Coins: ${Number(order.coinAmount).toFixed(2)}`,
          ],
        },
        {
          title: "Items",
          lines: order.items.map(
            (i) =>
              `${i.productName} x ${i.quantity} - Rs ${Number(i.unitPriceInr).toFixed(2)} / ${Number(i.unitPriceCoins).toFixed(1)} coins`,
          ),
        },
      ],
    });

    return pdfResponse(`nexplast-invoice-${order.id.slice(0, 8)}.pdf`, bytes);
  } catch (error) {
    if (error instanceof AuthHttpError) {
      if (error.code === "UNAUTHORIZED") return apiUnauthorized();
      return apiForbidden(error.message);
    }
    console.error("[pdf/invoice]", error);
    return apiServerError("PDF generation failed.");
  }
}
