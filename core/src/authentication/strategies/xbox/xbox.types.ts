import {z} from "zod";

export const AuthenticationRequestBodySchema = z.object({
    IssueInstant: z.string(),
    NotAfter: z.string(),
    Token: z.string(),
    DisplayClaims: z.object({
        xui: z.array(z.object({uhs: z.string()})),
    }),
});

export const XSTSRequestBodySchema = z.object({
    IssueInstant: z.string(),
    NotAfter: z.string(),
    Token: z.string(),
    DisplayClaims: z.object({
        xui: z.array(
            z.object({
                gtg: z.string(),
                xid: z.string(),
            }),
        ),
    }),
});

export const XboxProfileSchema = z.object({
    id: z.string(),
    displayName: z.string(),
});

export type XboxProfile = z.infer<typeof XboxProfileSchema>;
