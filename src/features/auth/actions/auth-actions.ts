"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import {
  assignRoleSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/validations/auth";
import {
  assignUserRoleByAdmin,
  authenticateWithPassword,
  createPasswordResetToken,
  createUserWithPassword,
  resetPasswordWithToken,
} from "@/features/auth/services/user-service";
import {
  AuthHttpError,
  requireAdmin,
} from "@/features/auth/services/guards";
import { getRoleHomePath } from "@/utils/roles";
import { logger } from "@/utils/logger";
import type { UserRole } from "@/constants/roles";
import { UserRole as Roles } from "@/constants/roles";

export type ActionResult =
  | { success: true; message?: string; redirectTo?: string; resetToken?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

function zodFieldErrors(
  error: {
    flatten: () => { fieldErrors: Record<string, string[] | undefined> };
  },
): Record<string, string[]> {
  const flat = error.flatten().fieldErrors;
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(flat)) {
    if (value && value.length > 0) result[key] = value;
  }
  return result;
}

/**
 * Public registration — always creates a USER account.
 */
export async function registerAction(raw: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  try {
    await createUserWithPassword({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    return {
      success: true,
      message: "Account created successfully.",
      redirectTo: getRoleHomePath(Roles.USER),
    };
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_IN_USE") {
      return {
        success: false,
        error: "An account with this email already exists.",
        fieldErrors: { email: ["Email is already registered"] },
      };
    }
    logger.error(
      "Registration failed",
      { error: error instanceof Error ? error.message : "unknown" },
      "auth",
    );
    return {
      success: false,
      error: "Unable to create account. Please try again.",
    };
  }
}

/**
 * Email/password sign-in via Auth.js Credentials provider.
 */
export async function loginAction(raw: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  try {
    // Resolve user once for redirect; Credentials authorize verifies again securely.
    const user = await authenticateWithPassword(
      parsed.data.email,
      parsed.data.password,
    );
    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: "Invalid email or password." };
    }

    return {
      success: true,
      message: "Welcome back!",
      redirectTo: getRoleHomePath(user.role as UserRole),
    };
  } catch (error) {
    if (error instanceof Error && error.message === "ACCOUNT_DISABLED") {
      return { success: false, error: "This account has been disabled." };
    }
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password." };
    }
    logger.error(
      "Login failed",
      { error: error instanceof Error ? error.message : "unknown" },
      "auth",
    );
    return { success: false, error: "Unable to sign in. Please try again." };
  }
}

export async function forgotPasswordAction(
  raw: unknown,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Enter a valid email address.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  try {
    const result = await createPasswordResetToken(parsed.data.email);
    const payload: ActionResult = {
      success: true,
      message:
        "If an account exists for that email, password reset instructions are ready.",
    };

    if (process.env.NODE_ENV === "development" && result) {
      payload.resetToken = result.rawToken;
      logger.info(
        "Dev password reset token issued",
        { email: parsed.data.email },
        "auth",
      );
    }

    return payload;
  } catch (error) {
    logger.error(
      "Forgot password failed",
      { error: error instanceof Error ? error.message : "unknown" },
      "auth",
    );
    return {
      success: true,
      message:
        "If an account exists for that email, password reset instructions are ready.",
    };
  }
}

export async function resetPasswordAction(
  raw: unknown,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  try {
    const ok = await resetPasswordWithToken({
      email: parsed.data.email,
      token: parsed.data.token,
      password: parsed.data.password,
    });

    if (!ok) {
      return {
        success: false,
        error: "Reset link is invalid or has expired. Request a new one.",
      };
    }

    return {
      success: true,
      message: "Password updated. You can sign in with your new password.",
      redirectTo: "/login",
    };
  } catch (error) {
    logger.error(
      "Reset password failed",
      { error: error instanceof Error ? error.message : "unknown" },
      "auth",
    );
    return {
      success: false,
      error: "Unable to reset password. Please try again.",
    };
  }
}

/**
 * Admin-only: assign USER / COLLECTOR / RECYCLER / SELLER roles.
 */
export async function assignRoleAction(raw: unknown): Promise<ActionResult> {
  const parsed = assignRoleSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid role assignment request.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  try {
    const admin = await requireAdmin();
    await assignUserRoleByAdmin({
      actorId: admin.id,
      actorRole: admin.role,
      targetUserId: parsed.data.userId,
      role: parsed.data.role,
    });

    return {
      success: true,
      message: `Role updated to ${parsed.data.role}. Ask the user to sign in again so access updates.`,
    };
  } catch (error) {
    if (error instanceof AuthHttpError) {
      const byCode: Record<string, string> = {
        FORBIDDEN: "Admin access required.",
        UNAUTHORIZED: "You must be signed in.",
      };
      return {
        success: false,
        error: byCode[error.code] ?? error.message,
      };
    }

    const message = error instanceof Error ? error.message : "unknown";
    const map: Record<string, string> = {
      FORBIDDEN: "Admin access required.",
      INVALID_ROLE: "That role cannot be assigned here.",
      CANNOT_CHANGE_OWN_ROLE: "You cannot change your own role.",
      CANNOT_MODIFY_ADMIN: "Admin accounts cannot be modified here.",
      USER_NOT_FOUND: "User not found.",
    };
    logger.error("Role assignment failed", { error: message }, "auth");
    return {
      success: false,
      error: map[message] ?? "Unable to update role.",
    };
  }
}
