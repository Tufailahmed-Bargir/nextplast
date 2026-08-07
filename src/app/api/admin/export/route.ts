import { NextRequest } from "next/server";
import {
  AuthHttpError,
  requireAdmin,
} from "@/features/auth/services/guards";
import { prisma } from "@/prisma";
import { csvResponse } from "@/utils/csv";
import {
  apiForbidden,
  apiServerError,
  apiUnauthorized,
  apiValidationError,
} from "@/utils/api-response";

type ExportKind =
  | "users"
  | "listings"
  | "orders"
  | "inventory"
  | "wallet"
  | "leaderboard";

/**
 * Admin CSV exports for demo / viva reporting.
 * GET /api/admin/export?type=users|listings|orders|inventory|wallet|leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const type = (request.nextUrl.searchParams.get("type") ??
      "") as ExportKind;

    switch (type) {
      case "users": {
        const rows = await prisma.user.findMany({
          where: { deletedAt: null },
          take: 5000,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        });
        return csvResponse(
          "nexplast-users.csv",
          ["id", "name", "email", "role", "isActive", "createdAt"],
          rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
        );
      }
      case "listings": {
        const rows = await prisma.plasticListing.findMany({
          where: { deletedAt: null },
          take: 5000,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            userId: true,
            status: true,
            quality: true,
            claimedWeightGrams: true,
            estimatedCoins: true,
            createdAt: true,
          },
        });
        return csvResponse(
          "nexplast-listings.csv",
          [
            "id",
            "userId",
            "status",
            "quality",
            "claimedWeightGrams",
            "estimatedCoins",
            "createdAt",
          ],
          rows.map((r) => ({
            ...r,
            estimatedCoins: Number(r.estimatedCoins ?? 0),
            createdAt: r.createdAt.toISOString(),
          })),
        );
      }
      case "orders": {
        const rows = await prisma.order.findMany({
          take: 5000,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            userId: true,
            status: true,
            paymentMode: true,
            cashAmountInr: true,
            coinAmount: true,
            createdAt: true,
          },
        });
        return csvResponse(
          "nexplast-orders.csv",
          [
            "id",
            "userId",
            "status",
            "paymentMode",
            "cashAmountInr",
            "coinAmount",
            "createdAt",
          ],
          rows.map((r) => ({
            ...r,
            cashAmountInr: Number(r.cashAmountInr),
            coinAmount: Number(r.coinAmount),
            createdAt: r.createdAt.toISOString(),
          })),
        );
      }
      case "inventory": {
        const rows = await prisma.inventory.findMany({
          take: 5000,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            ownerType: true,
            grade: true,
            quantityGrams: true,
            categoryId: true,
            createdAt: true,
          },
        });
        return csvResponse(
          "nexplast-inventory.csv",
          [
            "id",
            "ownerType",
            "grade",
            "quantityGrams",
            "categoryId",
            "createdAt",
          ],
          rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
        );
      }
      case "wallet": {
        const rows = await prisma.walletTransaction.findMany({
          take: 5000,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            walletId: true,
            type: true,
            status: true,
            amount: true,
            title: true,
            createdAt: true,
          },
        });
        return csvResponse(
          "nexplast-wallet-transactions.csv",
          ["id", "walletId", "type", "status", "amount", "title", "createdAt"],
          rows.map((r) => ({
            ...r,
            amount: Number(r.amount),
            createdAt: r.createdAt.toISOString(),
          })),
        );
      }
      case "leaderboard": {
        const rows = await prisma.leaderboard.findMany({
          take: 5000,
          orderBy: { score: "desc" },
          select: {
            id: true,
            userId: true,
            periodType: true,
            periodKey: true,
            score: true,
            rank: true,
          },
        });
        return csvResponse(
          "nexplast-leaderboard.csv",
          ["id", "userId", "periodType", "periodKey", "score", "rank"],
          rows.map((r) => ({ ...r, score: Number(r.score) })),
        );
      }
      default:
        return apiValidationError(
          { type },
          "type must be users|listings|orders|inventory|wallet|leaderboard",
        );
    }
  } catch (error) {
    if (error instanceof AuthHttpError) {
      if (error.code === "UNAUTHORIZED") return apiUnauthorized();
      return apiForbidden(error.message);
    }
    return apiServerError("Export failed.");
  }
}
