import {z} from "zod";

export const GetOrganizationBranding_Request = z.object({id: z.number()});

export const GetOrganizationBranding_Response = z.object({
    name: z.string(),
    primaryColor: z.string(),
    logoUrl: z.string(),
    websiteUrl: z.string(),
});
