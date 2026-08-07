import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/constants/roles";
import { getRoleHomePath } from "@/utils/roles";

/**
 * Post-OAuth / post-login landing — routes each role to its home.
 */
export default async function AuthContinuePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  redirect(getRoleHomePath(session.user.role ?? UserRole.USER));
}
