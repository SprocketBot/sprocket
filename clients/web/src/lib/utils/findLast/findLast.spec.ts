import {findLast} from "./findLast";

describe("findLast", () => {
    it("should return undefined if array is undefined", () => {
        const arr = undefined;

        const expected = undefined;
        const actual = findLast(arr, () => true);

        expect(actual).toEqual(expected);
    });

    it("should return undefined if array is empty", () => {
        const arr = [];

        const expected = undefined;
        const actual = findLast(arr, () => true);

        expect(actual).toEqual(expected);
    });

    it("should return the last element that matches predicate", () => {
        const arr = [1, 2];
        const predicate = (v: number): boolean => v > 0;

        const expected = 2;
        const actual = findLast(arr, predicate);

        expect(actual).toEqual(expected);
    });

    it("should pass value, index, and full array to predicate", () => {
        const arr = [-7, 3, 7, 0, -4, 1, 3];

        const predicate = (v: number, i: number, a: number[]): boolean => {
            expect(a).toEqual(arr);
            expect(v).toEqual(arr[i]);
            return false;
        };

        findLast(arr, predicate);
    });
});
