import { isOk, type Parser } from "./types.ts";

export const chain = <
  A,
  const ExpectedA extends string[],
  B,
  const ExpectedB extends string[],
>(
  parser: Parser<A, ExpectedA>,
  fn: (value: A) => Parser<B, ExpectedB>,
): Parser<B, ExpectedA | ExpectedB> =>
(reader, ...context) => {
  const a = parser(reader, ...context);
  if (!isOk(a)) return a;
  return fn(a[2])(reader, ...a[1]);
};
