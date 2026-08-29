/**
 * Decode the payload segment of a JWT.
 *
 * JWT payloads are base64url-encoded (RFC 7515), which uses `-`/`_` in place of
 * `+`/`/` and omits `=` padding. Decoding with a plain base64 decoder (e.g.
 * `Buffer.from(str, "base64")` or `atob`) silently drops `-`/`_` characters,
 * corrupting the JSON for any token that contains them. This helper normalizes
 * base64url back to base64 before decoding.
 *
 * Works in both Node (SvelteKit server hooks) and the browser (client).
 */
export const decodeJwtPayload = <T = Record<string, unknown>>(rawToken: string): T | null => {
    const payloadSegment = rawToken.split(".")[1];
    if (!payloadSegment) return null;

    try {
        const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
        return JSON.parse(atob(padded)) as T;
    } catch (e) {
        return null;
    }
};