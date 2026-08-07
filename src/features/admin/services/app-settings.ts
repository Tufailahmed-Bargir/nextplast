import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/prisma";
import { SETTING_KEYS } from "@/validations/admin";

export type GeneralSettings = {
  platformName: string;
  supportEmail: string;
};

export type MarketplaceSettings = {
  enabled: boolean;
  allowHybridPayments: boolean;
};

export type WalletSettings = {
  adjustmentsEnabled: boolean;
  maxAdjustmentCoins: number;
};

export type NotificationSettings = {
  pickupEmailsEnabled: boolean;
  rewardEmailsEnabled: boolean;
};

const DEFAULTS = {
  [SETTING_KEYS.general]: {
    platformName: "NexPlast",
    supportEmail: "support@nexplast.local",
  } satisfies GeneralSettings,
  [SETTING_KEYS.marketplace]: {
    enabled: true,
    allowHybridPayments: true,
  } satisfies MarketplaceSettings,
  [SETTING_KEYS.wallet]: {
    adjustmentsEnabled: true,
    maxAdjustmentCoins: 10_000,
  } satisfies WalletSettings,
  [SETTING_KEYS.notifications]: {
    pickupEmailsEnabled: false,
    rewardEmailsEnabled: false,
  } satisfies NotificationSettings,
} as const;

export async function getSetting<T extends Record<string, unknown>>(
  key: string,
  fallback: T,
): Promise<T> {
  const row = await prisma.appSettings.findUnique({ where: { key } });
  if (!row) return fallback;
  return { ...fallback, ...(row.value as object) } as T;
}

export async function upsertSetting(input: {
  key: string;
  label?: string;
  value: Record<string, unknown>;
}) {
  return prisma.appSettings.upsert({
    where: { key: input.key },
    create: {
      key: input.key,
      label: input.label,
      value: input.value as Prisma.InputJsonValue,
    },
    update: {
      label: input.label,
      value: input.value as Prisma.InputJsonValue,
    },
  });
}

export async function getPlatformSettings() {
  const [general, marketplace, wallet, notifications] = await Promise.all([
    getSetting(SETTING_KEYS.general, DEFAULTS[SETTING_KEYS.general]),
    getSetting(SETTING_KEYS.marketplace, DEFAULTS[SETTING_KEYS.marketplace]),
    getSetting(SETTING_KEYS.wallet, DEFAULTS[SETTING_KEYS.wallet]),
    getSetting(
      SETTING_KEYS.notifications,
      DEFAULTS[SETTING_KEYS.notifications],
    ),
  ]);
  return { general, marketplace, wallet, notifications };
}
