interface CombinationOptions<T> {
    check?: (a: T[]) => boolean;
    sort?: (a: T, b: T) => number;
}

export function createCombinations<T>(
    array: T[],
    n: number,
    {check, sort}: CombinationOptions<T>,
): T[][] {
    const out = new Set<T[]>();

    const r: T[] = new Array<T>(n);

    const innerCombine = (input: T[], len: number, start: number): void => {
        // Base Case
        if (len === 0) {
            if (!check || check(r)) {
                let item = [...r];
                if (sort) item = item.sort(sort);
                out.add(item);
            }
            return;
        }

        for (let i = start; i <= input.length - len; i++) {
            r[r.length - len] = input[i];
            innerCombine(input, len - 1, i + 1);
        }
    };

    innerCombine(array, n, 0);
    return Array.from(out);
}
