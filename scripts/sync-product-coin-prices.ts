/**
 * Sync marketplace priceCoins from priceInr using 1 coin ≈ ₹0.50 (coins = INR × 2).
 * Usage: bun run scripts/sync-product-coin-prices.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const INTERNAL_VALUE_INR = 0.5;

function inrToCoins(priceInr: number) {
  return Math.round(priceInr / INTERNAL_VALUE_INR);
}

async function main() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, priceInr: true, priceCoins: true },
  });

  console.log(`Syncing coin prices for ${products.length} products...`);

  let updated = 0;
  for (const product of products) {
    const priceInr = Number(product.priceInr.toString());
    const priceCoins = inrToCoins(priceInr);
    const hybridCashInr = Number((priceInr * 0.6).toFixed(2));
    const hybridCoins = Number((priceCoins * 0.4).toFixed(2));

    await prisma.product.update({
      where: { id: product.id },
      data: {
        priceCoins,
        hybridCashInr,
        hybridCoins,
      },
    });
    updated += 1;
    console.log(
      `  ${product.name}: ₹${priceInr} → ${priceCoins} coins (was ${product.priceCoins})`,
    );
  }

  console.log(`Done. Updated ${updated} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
