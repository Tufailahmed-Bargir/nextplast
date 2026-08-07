import { z } from "zod";
import { UserRole } from "@/constants/roles";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[0-9]/, "Include at least one number");

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Public registration — role is never accepted from the client. */
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    token: z.string().min(16, "Reset token is invalid"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/** Roles an Admin may assign (Collector/Recycler elevation is admin-only). */
export const adminAssignableRoles = [
  UserRole.USER,
  UserRole.COLLECTOR,
  UserRole.RECYCLER,
  UserRole.SELLER,
] as const;

export const assignRoleSchema = z.object({
  userId: z.string().min(1, "User id is required"),
  role: z.enum(adminAssignableRoles),
});

export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
