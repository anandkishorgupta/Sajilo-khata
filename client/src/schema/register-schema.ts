import { z } from "zod";

export const registerSchema = z.object({
    ownerName: z.string().min(2),
    shopName: z.string().min(2),
    phone: z.string().min(10),
    city: z.string().min(2),
    email: z.email(),
    password: z.string().min(6),
});

export type RegisterFormData = z.infer<typeof registerSchema>;