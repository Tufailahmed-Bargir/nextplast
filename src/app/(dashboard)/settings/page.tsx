import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { SettingsForms } from "@/features/settings/components/settings-forms";

export const metadata: Metadata = { title: "Settings" };

const defaultPrefs = {
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: false,
  language: "en" as const,
  privacyShowOnLeaderboard: true,
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });
  if (!user || user.deletedAt) redirect("/login");

  const prefsRaw = (user.profile?.preferences ?? {}) as Partial<typeof defaultPrefs>;
  const preferences = { ...defaultPrefs, ...prefsRaw };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Profile, notifications, privacy, password, and account controls.
        </p>
      </div>
      <SettingsForms
        initial={{
          name: user.name ?? "",
          email: user.email,
          phone: user.profile?.phone ?? "",
          city: user.profile?.city ?? "",
          address: user.profile?.address ?? "",
          bio: user.profile?.bio ?? "",
          referralCode: user.profile?.referralCode ?? null,
          preferences,
        }}
      />
    </div>
  );
}
