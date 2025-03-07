import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(5, "Username must be at least 5 characters long")
  .max(10, "Username must be at most 10 characters long")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  );

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
