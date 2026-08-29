import {decodeJwtPayload} from "./decodeJwt";

export const extractJwt = <T>(rawToken: string): T => {
    const payload = decodeJwtPayload<T>(rawToken);
    if (!payload) throw new Error("Invalid JWT token");
    return payload;
};