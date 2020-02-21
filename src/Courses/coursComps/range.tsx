// returns a function that receives 3args and returns boolean:
const rangeConditions = (
  includeZero: boolean
): ((
  lastVal: string | number,
  newVal: string | number,
  threshold: number
) => boolean) => {
  // first condition is to make sure that after rounding no two numbers are same
  // second one is to make sure that 0 is not encluded in range
  if (!includeZero)
    return (lastVal, newVal, threshold) =>
      Math.abs(Number(lastVal) - Number(newVal)) >= threshold &&
      Math.abs(Number(newVal)) - threshold > 0;
  else
    return (lastVal, newVal, threshold) =>
      Math.abs(Number(lastVal) - Number(newVal)) >= threshold;
};

/**
 * computes an array of numbers form start to end with a step size.
 * @param start:start number
 * @param end:end number
 * @param step: step size
 * @param percision ?: round numbers with a percision
 * @param lastIncluded ?: if array should contains the end number
 * @param includeZero ?: if array should contains zero
 * @param threshold ?: minimum gap between numbers after rounding
 */

export default function range(
  start: number,
  end: number,
  step: number = 1,
  percision: number = 2,
  lastIncluded: boolean = true,
  includeZero: boolean = true,
  threshold?: number
): Array<number> {
  let idx = -1;
  let length = Math.max(Math.ceil((end - start) / step), 0);
  if (lastIncluded) length++;
  var result = new Array(length);

  const con = rangeConditions(includeZero);
  while (length--) {
    result[++idx] = start.toFixed(percision);
    start += step;
  }

  // cleaning the result from repeating or undefined elements and applying extra conditions like includeZero etc.
  if (!threshold) threshold = step - step / 10;
  result = result.filter((val, index, arr) => {
    return index === 0
      ? true
      : // prettier-ignore
        // @ts-ignore
        con(arr[index - 1], val, threshold);
  });
  if (!lastIncluded) result = result.slice(0, -1);
  return result;
}
