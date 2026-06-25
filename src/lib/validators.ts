import { z } from "zod";

export const repoUrlSchema = z.object({
  url: z
    .string()
    .url("URL tidak valid")
    .refine(
      (url) => /github\.com\/[^\/]+\/[^\/\?#]+/.test(url),
      "Harus berupa URL repository GitHub yang valid",
    ),
});

export const createRepoSchema = z.object({
  url: z
    .string()
    .url("URL tidak valid")
    .refine(
      (url) => /github\.com\/[^\/]+\/[^\/\?#]+/.test(url),
      "Harus berupa URL repository GitHub yang valid",
    ),
  custom_title: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  category_ids: z.array(z.string().uuid()).optional(),
  is_favorite: z.boolean().optional(),
});

export const updateRepoSchema = z.object({
  custom_title: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  category_ids: z.array(z.string().uuid()).optional(),
  is_favorite: z.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").max(100),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Format warna hex tidak valid")
    .optional(),
  icon: z.string().max(10).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Format warna hex tidak valid")
    .optional(),
  icon: z.string().max(10).optional(),
});

export type CreateRepoInput = z.infer<typeof createRepoSchema>;
export type UpdateRepoInput = z.infer<typeof updateRepoSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
