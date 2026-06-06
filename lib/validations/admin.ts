import { z } from "zod";
import { passwordSchema } from "./user";

export const createUserSchema = z.object({
  email: z.string().email("Email invalide"),
  password: passwordSchema,
  firstName: z.string().min(1, "Prénom requis").max(50),
  lastName: z.string().min(1, "Nom requis").max(50),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  active: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  userId: z.string().uuid("userId invalide"),
  firstName: z.string().min(1, "Prénom requis").max(50),
  lastName: z.string().min(1, "Nom requis").max(50),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  active: z.boolean().default(true),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
