import "server-only";

import { getSetting } from "@/features/admin/services/app-settings";
import { SETTING_KEYS } from "@/validations/admin";
import type { MarketplaceSettings } from "@/features/admin/services/app-settings";

export async function getMarketplaceFlags(): Promise<MarketplaceSettings> {
  return getSetting(SETTING_KEYS.marketplace, {
    enabled: true,
    allowHybridPayments: true,
  });
}

export async function assertMarketplaceEnabled() {
  const flags = await getMarketplaceFlags();
  if (!flags.enabled) throw new Error("MARKETPLACE_DISABLED");
  return flags;
}
