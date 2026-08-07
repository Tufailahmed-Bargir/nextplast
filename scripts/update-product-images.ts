/**
 * Replace Cloudinary demo / placeholder product images with eco-product Pexels URLs.
 * Usage: bun run scripts/update-product-images.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Curated eco / recycled product imagery (Pexels, allowed in next.config). */
const ECO_IMAGES = [
  "https://images.pexels.com/photos/5650026/pexels-photo-5650026.jpeg?auto=compress&cs=tinysrgb&w=800", // tote / shopping bag
  "https://images.pexels.com/photos/3737604/pexels-photo-3737604.jpeg?auto=compress&cs=tinysrgb&w=800", // bamboo toothbrush
  "https://images.pexels.com/photos/6693655/pexels-photo-6693655.jpeg?auto=compress&cs=tinysrgb&w=800", // desk / organizer
  "https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&w=800", // phone / tech accessory
  "https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=800", // kitchen cleaning
  "https://images.pexels.com/photos/1925536/pexels-photo-1925536.jpeg?auto=compress&cs=tinysrgb&w=800", // notebook / stationery
  "https://images.pexels.com/photos/13871766/pexels-photo-13871766.jpeg?auto=compress&cs=tinysrgb&w=800", // eco bottle
  "https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg?auto=compress&cs=tinysrgb&w=800", // reusable containers
  "https://images.pexels.com/photos/7262996/pexels-photo-7262996.jpeg?auto=compress&cs=tinysrgb&w=800", // eco toiletries
  "https://images.pexels.com/photos/3737594/pexels-photo-3737594.jpeg?auto=compress&cs=tinysrgb&w=800", // bamboo / natural care
  "https://images.pexels.com/photos/3738349/pexels-photo-3738349.jpeg?auto=compress&cs=tinysrgb&w=800", // sustainable lifestyle
  "https://images.pexels.com/photos/7262772/pexels-photo-7262772.jpeg?auto=compress&cs=tinysrgb&w=800", // zero waste kit
] as const;

async function main() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      images: { select: { id: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  console.log(`Updating images for ${products.length} products...`);

  let updated = 0;
  for (let i = 0; i < products.length; i += 1) {
    const product = products[i]!;
    const url = ECO_IMAGES[i % ECO_IMAGES.length]!;

    if (product.images.length === 0) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url,
          sortOrder: 0,
          isPrimary: true,
        },
      });
      updated += 1;
      continue;
    }

    for (const img of product.images) {
      await prisma.productImage.update({
        where: { id: img.id },
        data: { url },
      });
      updated += 1;
    }
  }

  console.log(`Done. Updated ${updated} image row(s) across ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
