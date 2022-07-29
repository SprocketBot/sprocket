import type Crypto from "crypto";

let crypto: typeof Crypto;

export const getCrypto = async (): Promise<typeof Crypto> => {
    if (crypto !== undefined) return crypto;

    // eslint-disable-next-line require-atomic-updates
    crypto = await import("crypto");
    return crypto;
};
