import {z} from "zod";

export enum SprocketConfigurationKey {
    DISABLE_DISCORD_DMS = "DISABLE_DISCORD_DMS",
}

export const GetSprocketConfiguration_Request = z.object({
    key: z.nativeEnum(SprocketConfigurationKey).optional(),
});

export const GetSprocketConfiguration_Response = z.array(z.object({
    key: z.nativeEnum(SprocketConfigurationKey),
    value: z.string(),
}));
