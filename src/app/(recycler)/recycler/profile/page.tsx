import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/constants/roles";
import { isAdmin } from "@/utils/roles";
import { getRecyclerForUser } from "@/features/recycler/services/purchase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Recycler Profile" };

export default async function RecyclerProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (
    session.user.role !== UserRole.RECYCLER &&
    !isAdmin(session.user.role)
  ) {
    redirect("/unauthorized");
  }

  const recycler = await getRecyclerForUser(session.user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Company profile</h2>
        <p className="text-sm text-muted-foreground">
          Partner details managed with admin approval.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {recycler?.companyName ?? "Recycler"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Email: </span>
            {recycler?.user.email ?? session.user.email}
          </p>
          <p>
            <span className="text-muted-foreground">Phone: </span>
            {recycler?.contactPhone ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Address: </span>
            {recycler?.address ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Status: </span>
            {recycler?.verificationStatus ?? "—"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
