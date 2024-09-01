export const isRangeValid = (min: number, max: number): boolean =>
  min <= max &&
  min >= 0 &&
  max >= 0 &&
  Number.isInteger(min) &&
  min !== Infinity &&
  (Number.isInteger(max) || max === Infinity);
