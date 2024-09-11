import {
  discardPreviousPosition,
  isOk,
  type Parser,
  restorePreviousPosition,
  saveCurrentPosition,
} from "./types.ts";

export const or = <
  A,
  B,
  const ExpectedA extends string[],
  const ExpectedB extends string[],
>(
  parserA: Parser<A, ExpectedA>,
  parserB: Parser<B, ExpectedB>,
): Parser<A | B, [...ExpectedA, ...ExpectedB]> =>
(reader, ...context) => {
  const a = parserA(reader, ...saveCurrentPosition(reader, context));
  if (isOk(a)) {
    return [true, discardPreviousPosition(reader, a[1]), a[2]];
  }

  const b = parserB(reader, ...restorePreviousPosition(reader, a[1]));
  if (isOk(b)) return b;
  const [x, next, expected] = b;
  return [x, next, [...a[2], ...expected]];
};
