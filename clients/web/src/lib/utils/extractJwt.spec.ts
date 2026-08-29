import {extractJwt} from "./extractJwt";

const base64url = (input: string): string => Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const makeToken = (payload: Record<string, unknown>): string =>
    `${base64url(JSON.stringify({alg: "HS256"}))}.${base64url(JSON.stringify(payload))}.signature`;

describe("extractJwt", () => {
    it("extracts the payload from a JWT", () => {
        const payload = {userId: 1, username: "test"};
        expect(extractJwt<typeof payload>(makeToken(payload))).toEqual(payload);
    });

    it("decodes a base64url payload containing - and _ characters", () => {
        // Regression: the previous implementation used atob() directly, which
        // throws on base64url `-`/`_` characters and broke login for affected
        // users.
        const payload = {username: "5~", sub: "123456789012345678"};
        const token = makeToken(payload);
        expect(token).toMatch(/-/);
        expect(extractJwt<typeof payload>(token)).toEqual(payload);
    });

    it("throws for a malformed token", () => {
        expect(() => extractJwt("not-a-jwt")).toThrow();
    });
});