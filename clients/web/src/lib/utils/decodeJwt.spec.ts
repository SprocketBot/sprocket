import {decodeJwtPayload} from "./decodeJwt";

// Helper to base64url-encode a payload the way a JWT would be.
const base64url = (input: string): string => Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const makeToken = (payload: Record<string, unknown>): string =>
    `${base64url(JSON.stringify({alg: "HS256", typ: "JWT"}))}.${base64url(JSON.stringify(payload))}.signature`;

describe("decodeJwtPayload", () => {
    it("decodes a standard JWT payload", () => {
        const payload = {userId: 1, username: "test"};
        expect(decodeJwtPayload(makeToken(payload))).toEqual(payload);
    });

    it("decodes a payload whose base64url encoding contains - and _ characters", () => {
        // `atob` (used by the previous extractJwt implementation) throws on
        // base64url `-`/`_` characters. This payload's base64url encoding
        // contains `-`, so it would have failed before the fix.
        const payload = {username: "5~", sub: "123456789012345678"};
        const token = makeToken(payload);
        expect(token).toMatch(/-/);
        expect(decodeJwtPayload(token)).toEqual(payload);
    });

    it("returns null for a token with no payload segment", () => {
        expect(decodeJwtPayload("no-dots-here")).toBeNull();
    });

    it("returns null for a token with an invalid payload segment", () => {
        expect(decodeJwtPayload("header.not-json.signature")).toBeNull();
    });

    it("returns null for a token with an empty payload segment", () => {
        expect(decodeJwtPayload("header..signature")).toBeNull();
    });
});