/**
 * Returns the last element in the array where predicate is true, and undefined otherwise.
 * https://stackoverflow.com/a/53187807/9080819
 * @param arr The source array to search in
 * @param predicate find calls predicate once for each element of the array, in descending
 * order, until it finds one where predicate returns true. If such an element is found,
 * findLast immediately returns that element. Otherwise, findLastIndex returns undefined.
 */
export function findLast<T>(
  arr: T[] | undefined,
  predicate: (value?: T, index?: number, arr?: T[]) => boolean,
): T | undefined {
  if (arr === undefined) return undefined;

  let l = arr.length;
  while (l--) {
    if (predicate(arr[l], l, arr)) return arr[l];
  }
  return undefined;
}
