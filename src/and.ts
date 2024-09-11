import { isOk, type Parser } from "./types.ts";

export const and = <
  A,
  const ExpectedA extends string[],
  B,
  const ExpectedB extends string[],
>(
  parserA: Parser<A, ExpectedA>,
  parserB: Parser<B, ExpectedB>,
): Parser<[A, B], ExpectedA | ExpectedB> =>
(reader, ...prev) => {
  const a = parserA(reader, ...prev);
  if (!isOk(a)) return a;
  const [, next, value] = a;
  const b = parserB(reader, ...next);
  if (!isOk(b)) return b;
  return [true, b[1], [value, b[2]]];
};
