/**
 * Demo seed for final-year project presentation.
 * Usage: bun run scripts/seed-demo.ts
 */
import {
  ListingStatus,
  NotificationType,
  PaymentMode,
  PickupStatus,
  PlasticQuality,
  PrismaClient,
  UserRole,
  WalletTxStatus,
  WalletTxType,
  OrderStatus,
  LeaderboardPeriod,
  ProfileVerificationStatus,
  InventoryOwnerType,
  InventoryGrade,
  PlasticResinType,
  GamificationLevel,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const PASSWORD = "Demo@12345";

async function wipeDemoUsers() {
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: "@demo.nexplast.local" } },
    select: { id: true },
  });
  if (demoUsers.length === 0) return;

  const userIds = demoUsers.map((u) => u.id);

  const wallets = await prisma.wallet.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const walletIds = wallets.map((w) => w.id);

  const listings = await prisma.plasticListing.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const listingIds = listings.map((l) => l.id);

  const pickupsByListing =
    listingIds.length > 0
      ? await prisma.pickupRequest.findMany({
          where: { listingId: { in: listingIds } },
          select: { id: true },
        })
      : [];

  const collectors = await prisma.collector.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const collectorIds = collectors.map((c) => c.id);

  const pickupsByCollector =
    collectorIds.length > 0
      ? await prisma.pickupRequest.findMany({
          where: { collectorId: { in: collectorIds } },
          select: { id: true },
        })
      : [];

  const pickupIds = [
    ...new Set([...pickupsByListing, ...pickupsByCollector].map((p) => p.id)),
  ];

  const recyclers = await prisma.recycler.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const recyclerIds = recyclers.map((r) => r.id);

  const orders = await prisma.order.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const orderIds = orders.map((o) => o.id);

  const inventoryFilter: Array<{ recyclerId?: { in: string[] }; id?: { in: string[] } }> = [];
  if (recyclerIds.length) {
    inventoryFilter.push({ recyclerId: { in: recyclerIds } });
  }
  let movementInventoryIds: string[] = [];
  if (pickupIds.length || recyclerIds.length) {
    const movements = await prisma.inventoryMovement.findMany({
      where: {
        OR: [
          ...(pickupIds.length ? [{ pickupRequestId: { in: pickupIds } }] : []),
          ...(recyclerIds.length
            ? [{ inventory: { recyclerId: { in: recyclerIds } } }]
            : []),
        ],
      },
      select: { inventoryId: true },
    });
    movementInventoryIds = movements.map((m) => m.inventoryId);
    if (movementInventoryIds.length) {
      inventoryFilter.push({ id: { in: movementInventoryIds } });
    }
  }

  const inventoryOwned =
    inventoryFilter.length > 0
      ? await prisma.inventory.findMany({
          where: { OR: inventoryFilter },
          select: { id: true },
        })
      : [];
  const inventoryIds = [
    ...new Set([...inventoryOwned.map((i) => i.id), ...movementInventoryIds]),
  ];

  await prisma.$transaction(async (tx) => {
    if (walletIds.length) {
      await tx.walletTransaction.deleteMany({ where: { walletId: { in: walletIds } } });
    }
    if (pickupIds.length) {
      await tx.inventoryMovement.deleteMany({ where: { pickupRequestId: { in: pickupIds } } });
      await tx.collectorVerification.deleteMany({
        where: { pickupRequestId: { in: pickupIds } },
      });
    }
    if (inventoryIds.length) {
      await tx.inventoryMovement.deleteMany({ where: { inventoryId: { in: inventoryIds } } });
      await tx.inventory.deleteMany({ where: { id: { in: inventoryIds } } });
    }
    if (pickupIds.length) {
      await tx.pickupRequest.deleteMany({ where: { id: { in: pickupIds } } });
    }
    if (listingIds.length) {
      await tx.plasticListing.deleteMany({ where: { id: { in: listingIds } } });
    }
    if (orderIds.length) {
      await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await tx.order.deleteMany({ where: { id: { in: orderIds } } });
    }
    await tx.supportTicket.deleteMany({ where: { userId: { in: userIds } } });
    await tx.adminLog.deleteMany({ where: { adminId: { in: userIds } } });
    await tx.review.deleteMany({ where: { userId: { in: userIds } } });
    await tx.product.updateMany({
      where: { sellerId: { in: userIds } },
      data: { sellerId: null },
    });
    if (walletIds.length) {
      await tx.wallet.deleteMany({ where: { id: { in: walletIds } } });
    }
    await tx.user.deleteMany({ where: { id: { in: userIds } } });
  });
}

async function main() {
  console.log("Seeding NexPlast demo data...");
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  console.log("Clearing previous @demo.nexplast.local users...");
  await wipeDemoUsers();

  const cities = ["Pune", "Mumbai", "Nagpur", "Nashik", "Aurangabad"];
  const firstNames = [
    "Aarav", "Diya", "Ishaan", "Kavya", "Rohan", "Ananya", "Vivaan", "Meera",
    "Arjun", "Sara", "Kabir", "Nisha", "Aditya", "Pooja", "Yash", "Neha",
    "Om", "Riya", "Kunal", "Sneha",
  ];

  for (let i = 1; i <= 3; i += 1) {
    await prisma.user.create({
      data: {
        name: `Admin ${i}`,
        email: `admin${i}@demo.nexplast.local`,
        passwordHash,
        role: i === 1 ? UserRole.SUPER_ADMIN : UserRole.ADMIN,
        emailVerified: new Date(),
        profile: {
          create: {
            phone: `90000000${i}`,
            city: "Pune",
            address: `Admin Block ${i}, Campus Hub`,
            referralCode: `ADMIN${i}`,
            level: GamificationLevel.PLATINUM,
          },
        },
        wallet: { create: {} },
        environmentalImpact: { create: {} },
      },
    });
  }

  const users = [];
  for (let i = 0; i < 20; i += 1) {
    const name = firstNames[i]!;
    users.push(
      await prisma.user.create({
        data: {
          name,
          email: `user${i + 1}@demo.nexplast.local`,
          passwordHash,
          role: UserRole.USER,
          emailVerified: new Date(),
          profile: {
            create: {
              phone: `98${String(10000000 + i).slice(0, 8)}`,
              city: cities[i % cities.length],
              address: `${10 + i} Green Street`,
              bio: `${name} recycles weekly with NexPlast.`,
              referralCode: `USER${String(i + 1).padStart(2, "0")}`,
              level:
                i < 5
                  ? GamificationLevel.GOLD
                  : i < 12
                    ? GamificationLevel.SILVER
                    : GamificationLevel.BRONZE,
            },
          },
          wallet: {
            create: {
              availableBalance: 20 + i * 3,
              earnedTotal: 40 + i * 5,
              spentTotal: 10 + i,
            },
          },
          environmentalImpact: {
            create: {
              plasticRecycledGrams: 2000 + i * 500,
              co2SavedKg: 3 + i * 0.4,
              treesSaved: 0.5 + i * 0.1,
              oceanPlasticPreventedKg: 1 + i * 0.2,
              waterSavedLiters: 50 + i * 5,
              energySavedKwh: 10 + i,
              oilSavedLiters: 2 + i * 0.2,
            },
          },
        },
      }),
    );
  }

  const collectors = [];
  for (let i = 1; i <= 5; i += 1) {
    const user = await prisma.user.create({
      data: {
        name: `Collector ${i}`,
        email: `collector${i}@demo.nexplast.local`,
        passwordHash,
        role: UserRole.COLLECTOR,
        emailVerified: new Date(),
        profile: {
          create: {
            phone: `91${String(20000000 + i)}`,
            city: cities[i % cities.length],
            address: `Collector Depot ${i}`,
            referralCode: `COL${i}`,
          },
        },
        wallet: { create: { availableBalance: 15 } },
        environmentalImpact: { create: {} },
        collector: {
          create: {
            zone: cities[i % cities.length],
            isOnDuty: i <= 3,
            verificationStatus: ProfileVerificationStatus.APPROVED,
            completedPickups: 5 + i,
            rating: 4.2 + i * 0.1,
          },
        },
      },
      include: { collector: true },
    });
    collectors.push(user);
  }

  for (let i = 1; i <= 5; i += 1) {
    await prisma.user.create({
      data: {
        name: `Recycler ${i}`,
        email: `recycler${i}@demo.nexplast.local`,
        passwordHash,
        role: UserRole.RECYCLER,
        emailVerified: new Date(),
        profile: {
          create: {
            phone: `92${String(30000000 + i)}`,
            city: cities[i % cities.length],
            referralCode: `REC${i}`,
          },
        },
        wallet: { create: {} },
        environmentalImpact: { create: {} },
        recycler: {
          create: {
            companyName: `EcoCycle Plant ${i}`,
            address: `Industrial Area ${i}`,
            contactPhone: `923000000${i}`,
            verificationStatus: ProfileVerificationStatus.APPROVED,
          },
        },
      },
    });
  }

  const pet = await prisma.plasticCategory.upsert({
    where: { slug: "pet-bottles" },
    update: {},
    create: {
      name: "PET Bottles",
      slug: "pet-bottles",
      resinType: PlasticResinType.PET,
      description: "Clear drinking bottles",
    },
  });
  const hdpe = await prisma.plasticCategory.upsert({
    where: { slug: "hdpe-containers" },
    update: {},
    create: {
      name: "HDPE Containers",
      slug: "hdpe-containers",
      resinType: PlasticResinType.HDPE,
    },
  });

  const badgeDefs = [
    { code: "FIRST_PICKUP", name: "First Pickup", description: "Completed first verified pickup" },
    { code: "ECO_STARTER", name: "Eco Starter", description: "Recycled 5 kg plastic" },
    { code: "COIN_COLLECTOR", name: "Coin Collector", description: "Earned 50 Nature Coins" },
    { code: "MARKET_BUYER", name: "Market Buyer", description: "Placed first marketplace order" },
    { code: "GREEN_CHAMPION", name: "Green Champion", description: "Top monthly recycler" },
  ];
  for (const b of badgeDefs) {
    await prisma.badge.upsert({
      where: { code: b.code },
      update: { name: b.name, description: b.description, isActive: true },
      create: { ...b, isActive: true },
    });
  }
  const badges = await prisma.badge.findMany();

  for (let i = 0; i < 50; i += 1) {
    const user = users[i % users.length]!;
    const status =
      i < 30
        ? ListingStatus.COMPLETED
        : i < 40
          ? ListingStatus.AWAITING_COLLECTOR
          : ListingStatus.SUBMITTED;
    const listing = await prisma.plasticListing.create({
      data: {
        userId: user.id,
        status,
        quality: i % 3 === 0 ? PlasticQuality.CLEAN : PlasticQuality.MIXED,
        claimedWeightGrams: 1500 + (i % 10) * 250,
        estimatedCoins: 15 + (i % 8),
        notes: `Demo listing batch ${i + 1}`,
        pickupAddress: `${10 + i} Green Street, ${cities[i % cities.length]}`,
        items: {
          create: {
            categoryId: i % 2 === 0 ? pet.id : hdpe.id,
            claimedQuantity: 10 + (i % 5),
            claimedWeightGrams: 1500 + (i % 10) * 250,
          },
        },
        images: {
          create: {
            url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            sortOrder: 0,
            width: 640,
            height: 480,
            contentHash: `demo-hash-${i}`,
          },
        },
      },
    });

    if (i < 30) {
      const collector = collectors[i % collectors.length]!;
      await prisma.pickupRequest.create({
        data: {
          listingId: listing.id,
          collectorId: collector.collector!.id,
          status: PickupStatus.COMPLETED,
          address: `${10 + i} Green Street, ${cities[i % cities.length]}, 4110${i % 10}${i % 10}`,
          scheduledAt: new Date(Date.now() - (30 - i) * 86400000),
          completedAt: new Date(Date.now() - (29 - i) * 86400000),
          otpHash: "demo",
          verification: {
            create: {
              actualWeightGrams: 1400 + (i % 10) * 200,
              verifiedQuality: PlasticQuality.MIXED,
              recalculatedCoins: 14 + (i % 6),
              customerConfirmed: true,
            },
          },
        },
      });
    } else if (i < 40) {
      const collector = collectors[i % collectors.length]!;
      await prisma.pickupRequest.create({
        data: {
          listingId: listing.id,
          collectorId: collector.collector!.id,
          status: PickupStatus.ASSIGNED,
          address: `${10 + i} Green Street, ${cities[i % cities.length]}, 4110${i % 10}${i % 10}`,
          scheduledAt: new Date(Date.now() + (i - 30) * 86400000),
          otpHash: "demo",
        },
      });
    }
  }

  for (let i = 0; i < 40; i += 1) {
    const user = users[i % users.length]!;
    const wallet = await prisma.wallet.findUniqueOrThrow({
      where: { userId: user.id },
    });
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: i % 5 === 0 ? WalletTxType.SPEND : WalletTxType.EARN,
        status: WalletTxStatus.COMPLETED,
        amount: i % 5 === 0 ? 5 + (i % 3) : 8 + (i % 7),
        title: i % 5 === 0 ? "Marketplace redeem" : "Pickup reward",
        description: "Demo seeded transaction",
        balanceAfter: 20 + i,
      },
    });
  }

  const mcat = await prisma.marketplaceCategory.upsert({
    where: { slug: "eco-home" },
    update: {},
    create: {
      name: "Eco Home",
      slug: "eco-home",
      description: "Sustainable home products",
    },
  });

  const ecoProductImages = [
    "https://images.pexels.com/photos/5650026/pexels-photo-5650026.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3737604/pexels-photo-3737604.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/6693655/pexels-photo-6693655.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1925536/pexels-photo-1925536.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/13871766/pexels-photo-13871766.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/7262996/pexels-photo-7262996.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3737594/pexels-photo-3737594.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3738349/pexels-photo-3738349.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/7262772/pexels-photo-7262772.jpeg?auto=compress&cs=tinysrgb&w=800",
  ] as const;

  const products = [];
  for (let i = 1; i <= 50; i += 1) {
    const imageUrl = ecoProductImages[(i - 1) % ecoProductImages.length]!;
    const priceInr = 99 + (i % 20) * 25;
    const priceCoins = priceInr * 2; // 1 coin ≈ ₹0.50
    products.push(
      await prisma.product.upsert({
        where: { slug: `eco-product-${i}` },
        update: {
          name: `Eco Product ${i}`,
          description: `Demo sustainable product ${i} made with recycled materials.`,
          categoryId: mcat.id,
          priceInr,
          priceCoins,
          stock: 20 + (i % 10),
          isActive: true,
          ecoScore: 60 + (i % 40),
        },
        create: {
          name: `Eco Product ${i}`,
          slug: `eco-product-${i}`,
          description: `Demo sustainable product ${i} made with recycled materials.`,
          categoryId: mcat.id,
          priceInr,
          priceCoins,
          stock: 20 + (i % 10),
          isActive: true,
          ecoScore: 60 + (i % 40),
          images: {
            create: {
              url: imageUrl,
              sortOrder: 0,
              isPrimary: true,
            },
          },
        },
      }),
    );
  }

  for (let i = 0; i < 20; i += 1) {
    const user = users[i % users.length]!;
    const product = products[i % products.length]!;
    await prisma.order.create({
      data: {
        userId: user.id,
        status: i < 12 ? OrderStatus.DELIVERED : OrderStatus.PROCESSING,
        paymentMode: i % 3 === 0 ? PaymentMode.COINS : PaymentMode.HYBRID,
        cashAmountInr: i % 3 === 0 ? 0 : 120 + i * 5,
        coinAmount: 10 + (i % 8),
        shippingAddress: {
          fullName: user.name,
          phone: "9999999999",
          addressLine1: "Demo Address",
          city: "Pune",
          pinCode: "411001",
        },
        items: {
          create: {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            unitPriceInr: product.priceInr,
            unitPriceCoins: product.priceCoins,
            cashAmountInr: i % 3 === 0 ? 0 : product.priceInr,
            coinAmount: 10 + (i % 8),
          },
        },
        deliveredAt: i < 12 ? new Date() : null,
      },
    });
  }

  // 30 unique user-product reviews
  let reviewCount = 0;
  for (let u = 0; u < users.length && reviewCount < 30; u += 1) {
    for (let p = 0; p < products.length && reviewCount < 30; p += 1) {
      if ((u + p) % 3 !== 0) continue;
      await prisma.review.create({
        data: {
          userId: users[u]!.id,
          productId: products[p]!.id,
          rating: 3 + ((u + p) % 3),
          comment: "Happy to redeem Nature Coins on this eco product.",
        },
      });
      reviewCount += 1;
    }
  }

  for (let i = 0; i < 40; i += 1) {
    const user = users[i % users.length]!;
    await prisma.notification.create({
      data: {
        userId: user.id,
        type:
          i % 3 === 0
            ? NotificationType.PICKUP
            : i % 3 === 1
              ? NotificationType.REWARD
              : NotificationType.ORDER,
        title:
          i % 3 === 0
            ? "Pickup update"
            : i % 3 === 1
              ? "Coins credited"
              : "Order update",
        body: "Demo notification for final-year presentation.",
        readAt: i % 4 === 0 ? null : new Date(),
      },
    });
  }

  for (let i = 0; i < 10; i += 1) {
    const user = users[i]!;
    await prisma.leaderboard.create({
      data: {
        userId: user.id,
        periodType: LeaderboardPeriod.ALL_TIME,
        periodKey: "ALL",
        metric: "coins",
        score: 100 - i * 7,
        rank: i + 1,
      },
    });
    await prisma.userBadge.create({
      data: {
        userId: user.id,
        badgeId: badges[i % badges.length]!.id,
      },
    });
  }

  await prisma.inventory.upsert({
    where: {
      ownerKey_categoryId_grade: {
        ownerKey: "PLATFORM",
        categoryId: pet.id,
        grade: InventoryGrade.A,
      },
    },
    update: { quantityGrams: 25000 },
    create: {
      ownerType: InventoryOwnerType.PLATFORM,
      ownerKey: "PLATFORM",
      categoryId: pet.id,
      grade: InventoryGrade.A,
      quantityGrams: 25000,
    },
  });

  console.log("Demo seed complete.");
  console.log("Password for all demo accounts:", PASSWORD);
  console.log("  admin1@demo.nexplast.local");
  console.log("  user1@demo.nexplast.local");
  console.log("  collector1@demo.nexplast.local");
  console.log("  recycler1@demo.nexplast.local");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
