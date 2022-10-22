export interface JwtTokenSet {
    access: string;
    refresh: string;
}

export * from "./strategies/discord/discord.types";
export * from "./strategies/epic/epic.types";
export * from "./strategies/google/google.types";
export * from "./strategies/jwt/jwt.types";
export * from "./strategies/steam/steam.types";
