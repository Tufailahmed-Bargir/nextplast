import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/prisma";
import { writeAdminLog } from "@/features/admin/services/admin-audit";
import { inrToNatureCoins } from "@/utils/coin";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Ensure baseline marketplace categories exist (idempotent).
 */
export async function ensureMarketplaceCategories() {
  const defaults = [
    { name: "Home & Living", slug: "home-living", sortOrder: 1 },
    { name: "Personal Care", slug: "personal-care", sortOrder: 2 },
    { name: "Bags & Accessories", slug: "bags-accessories", sortOrder: 3 },
    { name: "Stationery", slug: "stationery", sortOrder: 4 },
    { name: "Kitchen", slug: "kitchen", sortOrder: 5 },
  ];

  for (const cat of defaults) {
    await prisma.marketplaceCategory.upsert({
      where: { slug: cat.slug },
      create: {
        name: cat.name,
        slug: cat.slug,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      update: { isActive: true },
    });
  }

  return prisma.marketplaceCategory.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Seed a starter catalog only when the marketplace has zero products.
 * Uses real Prisma persistence (not UI mock data).
 */
export async function seedStarterCatalogIfEmpty(adminId?: string) {
  const count = await prisma.product.count({
    where: { deletedAt: null },
  });
  if (count > 0) {
    return { seeded: false, count };
  }

  const categories = await ensureMarketplaceCategories();
  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const starters = [
    {
      name: "Recycled PET Tote Bag",
      slug: "recycled-pet-tote-bag",
      categorySlug: "bags-accessories",
      description:
        "Durable everyday tote made from recycled PET bottles. Lightweight, washable, and plastic-positive.",
      priceInr: 499,
      stock: 40,
      ecoScore: 92,
      materials: ["Recycled PET", "Organic cotton handles"],
      image:
        "https://images.pexels.com/photos/5650026/pexels-photo-5650026.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      name: "Bamboo Toothbrush Set",
      slug: "bamboo-toothbrush-set",
      categorySlug: "personal-care",
      description:
        "Pack of 4 biodegradable bamboo toothbrushes with soft bristles.",
      priceInr: 299,
      stock: 80,
      ecoScore: 88,
      materials: ["Bamboo", "Plant-based bristles"],
      image:
        "https://images.pexels.com/photos/3737604/pexels-photo-3737604.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      name: "rPET Desk Organizer",
      slug: "rpet-desk-organizer",
      categorySlug: "stationery",
      description:
        "Modular desk organizer crafted from recycled plastic pellets.",
      priceInr: 799,
      stock: 25,
      ecoScore: 85,
      materials: ["rPET", "Recycled PP"],
      image:
        "https://images.pexels.com/photos/6693655/pexels-photo-6693655.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      name: "Ocean-Plastic Phone Stand",
      slug: "ocean-plastic-phone-stand",
      categorySlug: "home-living",
      description:
        "Minimal phone stand molded from recovered ocean-bound plastics.",
      priceInr: 399,
      stock: 55,
      ecoScore: 90,
      materials: ["Ocean plastic", "Recycled ABS"],
      image:
        "https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      name: "Recycled Kitchen Scrub Set",
      slug: "recycled-kitchen-scrub-set",
      categorySlug: "kitchen",
      description:
        "Eco scrubbers and sponges made from recycled materials for daily kitchen use.",
      priceInr: 249,
      stock: 100,
      ecoScore: 80,
      materials: ["Recycled cellulose", "rPET mesh"],
      image:
        "https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      name: "Circular Economy Notebook",
      slug: "circular-economy-notebook",
      categorySlug: "stationery",
      description:
        "A5 notebook with covers made from recycled plastic waste and seed-paper bookmark.",
      priceInr: 199,
      stock: 120,
      ecoScore: 78,
      materials: ["Recycled paper", "rPET cover"],
      image:
        "https://images.pexels.com/photos/1925536/pexels-photo-1925536.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
  ];

  for (const item of starters) {
    const category = bySlug[item.categorySlug];
    if (!category) continue;

    const priceCoins = inrToNatureCoins(item.priceInr);
    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug || slugify(item.name),
        description: item.description,
        categoryId: category.id,
        priceInr: new Prisma.Decimal(item.priceInr),
        priceCoins: new Prisma.Decimal(priceCoins),
        hybridCashInr: new Prisma.Decimal(
          Number((item.priceInr * 0.6).toFixed(2)),
        ),
        hybridCoins: new Prisma.Decimal(
          Number((priceCoins * 0.4).toFixed(2)),
        ),
        stock: item.stock,
        ecoScore: item.ecoScore,
        materials: item.materials,
        isActive: true,
        images: {
          create: {
            url: item.image,
            isPrimary: true,
            sortOrder: 0,
          },
        },
      },
    });

    if (adminId) {
      await writeAdminLog(prisma, {
        adminId,
        action: "PRODUCT_SEEDED",
        targetType: "Product",
        targetId: product.id,
      });
    }
  }

  return {
    seeded: true,
    count: await prisma.product.count({ where: { deletedAt: null } }),
  };
}

export async function upsertAdminProduct(input: {
  adminId: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  priceInr: number;
  priceCoins: number;
  hybridCashInr?: number;
  hybridCoins?: number;
  stock: number;
  ecoScore?: number;
  materials?: string[];
  imageUrl?: string;
  isActive?: boolean;
}) {
  await ensureMarketplaceCategories();

  // Always derive coin price from INR (1 coin ≈ ₹0.50 ⇒ ₹100 = 200 coins).
  const priceCoins = inrToNatureCoins(input.priceInr);
  const hybridCashInr =
    input.hybridCashInr ?? Number((input.priceInr * 0.6).toFixed(2));
  const hybridCoins =
    input.hybridCoins ?? Number((priceCoins * 0.4).toFixed(2));

  const data = {
    name: input.name,
    slug: input.slug,
    description: input.description,
    categoryId: input.categoryId,
    priceInr: new Prisma.Decimal(input.priceInr),
    priceCoins: new Prisma.Decimal(priceCoins),
    hybridCashInr: new Prisma.Decimal(hybridCashInr),
    hybridCoins: new Prisma.Decimal(hybridCoins),
    stock: input.stock,
    ecoScore: input.ecoScore,
    materials: input.materials ?? [],
    isActive: input.isActive ?? true,
    deletedAt: null,
  };

  const product = input.id
    ? await prisma.product.update({
        where: { id: input.id },
        data,
      })
    : await prisma.product.create({ data });

  if (input.imageUrl) {
    const existing = await prisma.productImage.findFirst({
      where: { productId: product.id, isPrimary: true },
    });
    if (existing) {
      await prisma.productImage.update({
        where: { id: existing.id },
        data: { url: input.imageUrl },
      });
    } else {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: input.imageUrl,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }
  }

  await writeAdminLog(prisma, {
    adminId: input.adminId,
    action: input.id ? "PRODUCT_UPDATED" : "PRODUCT_CREATED",
    targetType: "Product",
    targetId: product.id,
  });

  return product;
}
