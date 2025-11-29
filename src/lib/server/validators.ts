import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.email(),
  password: z.string().min(8)
});

export const loginSchema = z.object({
  emailOrUsername: z.string(),
  password: z.string().min(1)
});

export const noteSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().optional()
});
