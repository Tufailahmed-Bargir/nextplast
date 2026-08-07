import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { getPlatformSettings } from "@/features/admin/services/app-settings";
import { SettingsForm } from "@/features/admin/components/settings-form";

export const metadata: Metadata = { title: "Admin Settings" };

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const settings = await getPlatformSettings();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Essential platform settings. Marketplace and notification flags are
          stored now and enforced in later phases; wallet rules apply immediately.
        </p>
      </div>
      <SettingsForm {...settings} />
    </div>
  );
}
