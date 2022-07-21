// eslint-disable-next-line no-confusing-arrow
const increasingOrder = (a: number, b: number): -1 | 0 | 1 => a < b ? -1 : 1;

/**
 * @example
 *  [
 *      [ [1, 2], [3, 4] ],
 *      [ [2, 1], [3, 4] ],
 *      [ [4, 3], [2, 1] ],
 *  ]
 *          |
 *          | Sort
 *          V
 *  [
 *      [ [1, 2], [3, 4] ],
 *      [ [1, 2], [3, 4] ],
 *      [ [1, 2], [3, 4] ],
 *  ]
 */
export const sortIds = (games: number[][][]): number[][][] => {
    const _games: number[][][] = [...games];
    for (const game of _games) {
        for (const team of game) {
            team.sort(increasingOrder);
        }
        game.sort((a, b) => increasingOrder(a[0], b[0]));
    }
    return _games;
};
