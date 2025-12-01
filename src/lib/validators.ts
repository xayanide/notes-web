import { z } from "zod";

export const signUpSchema = z.object({
  username: z
    .string()
    .nonempty("Username cannot be blank")
    .min(3, "Username may only contain at least 3 characters")
    .max(30, "Username cannot be more than 30 characters")
    .regex(
      /^(?!-)(?!.*--)[a-zA-Z0-9-]+(?<!-)$/,
      "Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen",
    ),
  email: z.string().nonempty("Email cannot be blank").email(),
  password: z
    .string()
    .nonempty("Password cannot be blank")
    .min(8, "Password should be at least 8 characters"),
});

export const signInSchema = z.object({
  emailOrUsername: z.string().min(1),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const noteSchema = z.object({
  title: z.string().min(1, "Title cannot be blank").max(255),
  content: z.string().optional(),
});
