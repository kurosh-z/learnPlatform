import range from './archive/range';

export function compTickValues(
  min: number,
  max: number,
  step: number | undefined = 1,
  percision?: number
) {
  const tickValues = range(min, max, step, percision, false, false);

  return tickValues;
}
