import * as z from 'zod';

export const OrganizationProfileSchema = z.object({
  name: z.string(),
  description: z.string(),
  websiteUrl: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  logoUrl: z.string().nullable().optional(),
});

export const OrganizationSchema = z.object({
  id: z.number(),
});

export type OrganizationProfile = z.infer<typeof OrganizationProfileSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
