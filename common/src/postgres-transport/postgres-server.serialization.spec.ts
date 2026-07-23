import {toJsonbParam} from "./postgres-transport";

function expectJsonParam(value: unknown): {
    toBe(expected: unknown): void;
} {
    return {
        toBe(expected: unknown): void {
            const actual = value === null ? null : JSON.parse(String(value)) as unknown;
            expect(actual).toEqual(expected);
        },
    };
}

describe("toJsonbParam", () => {
    it("serializes top-level arrays as JSON text", () => {
        const param = toJsonbParam([ {id: "scrim-1"}, {id: "scrim-2"} ]);

        expect(param).toBe("[{\"id\":\"scrim-1\"},{\"id\":\"scrim-2\"}]");
        expectJsonParam(param).toBe([ {id: "scrim-1"}, {id: "scrim-2"} ]);
    });

    it("serializes objects as JSON text", () => {
        expectJsonParam(toJsonbParam({name: "test", value: 123})).toBe({name: "test", value: 123});
    });

    it("preserves valid JSON strings as their parsed JSON value", () => {
        expectJsonParam(toJsonbParam("[1,2,3]")).toBe([1, 2, 3]);
    });

    it("stores plain strings as JSON strings", () => {
        expectJsonParam(toJsonbParam("plain text")).toBe("plain text");
    });

    it("stores null and undefined as SQL null", () => {
        expect(toJsonbParam(null)).toBeNull();
        expect(toJsonbParam(undefined)).toBeNull();
    });

    it("throws on circular references", () => {
        const obj: Record<string, unknown> = {name: "test"};
        obj.self = obj;

        expect(() => toJsonbParam(obj)).toThrow();
    });
});
