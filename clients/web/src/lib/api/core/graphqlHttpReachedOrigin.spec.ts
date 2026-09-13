import {graphqlHttpReachedOrigin} from "./graphqlHttpReachedOrigin";

describe("graphqlHttpReachedOrigin", () => {
    it("is false for a missing result", () => {
        expect(graphqlHttpReachedOrigin(undefined)).toBe(false);
        expect(graphqlHttpReachedOrigin(null)).toBe(false);
    });

    it("is true when Core answered with data and no error", () => {
        expect(graphqlHttpReachedOrigin({error: undefined})).toBe(true);
        expect(graphqlHttpReachedOrigin({})).toBe(true);
    });

    it("is true for GraphQL application errors (Core is up)", () => {
        expect(graphqlHttpReachedOrigin({
            error: {networkError: undefined},
        })).toBe(true);
        expect(graphqlHttpReachedOrigin({
            error: {networkError: null},
        })).toBe(true);
    });

    it("is false when the HTTP/WS transport failed", () => {
        expect(graphqlHttpReachedOrigin({
            error: {networkError: new Error("Failed to fetch")},
        })).toBe(false);
        expect(graphqlHttpReachedOrigin({
            error: {networkError: new Error("504")},
        })).toBe(false);
    });
});
