import { isOk, type Parser } from "./types.ts";

export const desc = <
  A,
  const ExpectedA extends string[],
  const Expected extends string[],
>(
  parser: Parser<A, ExpectedA>,
  expected: [...Expected],
): Parser<A, Expected> =>
(...args) => {
  const result = parser(...args);
  if (isOk(result)) return result;
  return [false, result[1], expected];
};
