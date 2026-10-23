"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { upsertSettingAction } from "@/features/admin/actions/admin-actions";
import { SETTING_KEYS } from "@/validations/admin";
import { usePendingAction } from "@/hooks/use-pending-action";
import type {
  GeneralSettings,
  MarketplaceSettings,
  NotificationSettings,
  WalletSettings,
} from "@/features/admin/services/app-settings";

interface SettingsFormProps {
  general: GeneralSettings;
  marketplace: MarketplaceSettings;
  wallet: WalletSettings;
  notifications: NotificationSettings;
}

export function SettingsForm({
  general,
  marketplace,
  wallet,
  notifications,
}: SettingsFormProps) {
  const router = useRouter();
  const { pending, run, isRunning } = usePendingAction();
  const [g, setG] = useState(general);
  const [m, setM] = useState(marketplace);
  const [w, setW] = useState(wallet);
  const [n, setN] = useState(notifications);

  function save(key: string, label: string, value: Record<string, unknown>) {
    run(key, async () => {
      const result = await upsertSettingAction({ key, label, value });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Platform name</Label>
            <Input
              value={g.platformName}
              onChange={(e) => setG({ ...g, platformName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Support email</Label>
            <Input
              value={g.supportEmail}
              onChange={(e) => setG({ ...g, supportEmail: e.target.value })}
            />
          </div>
          <Button
            type="button"
            disabled={pending}
            loading={isRunning(SETTING_KEYS.general)}
            onClick={() =>
              save(SETTING_KEYS.general, "General settings", { ...g })
            }
          >
            Save general
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Marketplace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={m.enabled}
              onChange={(e) => setM({ ...m, enabled: e.target.checked })}
            />
            Marketplace enabled
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={m.allowHybridPayments}
              onChange={(e) =>
                setM({ ...m, allowHybridPayments: e.target.checked })
              }
            />
            Allow hybrid payments
          </label>
          <Button
            type="button"
            disabled={pending}
            loading={isRunning(SETTING_KEYS.marketplace)}
            onClick={() =>
              save(SETTING_KEYS.marketplace, "Marketplace settings", { ...m })
            }
          >
            Save marketplace
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={w.adjustmentsEnabled}
              onChange={(e) =>
                setW({ ...w, adjustmentsEnabled: e.target.checked })
              }
            />
            Allow admin wallet adjustments
          </label>
          <div className="space-y-2">
            <Label>Max adjustment (coins)</Label>
            <Input
              type="number"
              value={w.maxAdjustmentCoins}
              onChange={(e) =>
                setW({
                  ...w,
                  maxAdjustmentCoins: Number(e.target.value) || 0,
                })
              }
            />
          </div>
          <Button
            type="button"
            disabled={pending}
            loading={isRunning(SETTING_KEYS.wallet)}
            onClick={() =>
              save(SETTING_KEYS.wallet, "Wallet settings", { ...w })
            }
          >
            Save wallet
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={n.pickupEmailsEnabled}
              onChange={(e) =>
                setN({ ...n, pickupEmailsEnabled: e.target.checked })
              }
            />
            Pickup email delivery (future)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={n.rewardEmailsEnabled}
              onChange={(e) =>
                setN({ ...n, rewardEmailsEnabled: e.target.checked })
              }
            />
            Reward email delivery (future)
          </label>
          <Button
            type="button"
            disabled={pending}
            loading={isRunning(SETTING_KEYS.notifications)}
            onClick={() =>
              save(SETTING_KEYS.notifications, "Notification settings", {
                ...n,
              })
            }
          >
            Save notifications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
