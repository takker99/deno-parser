import type { Parser } from "./parser.ts";

/**
 * Combines two parsers one after the other, yielding the results of both in
 * an array.
 *
 * @example
 * ```ts
 * import { and, text, tryParse } from "@takker/parser";
 *
 * const a = text("a");
 * const b = text("b");
 * const ab = and(a, b);
 * tryParse(ab, "a");
 * // => ["a", "b"]
```
 */
export const and = <
  A,
  const ExpectedA extends string[],
  B,
  const ExpectedB extends string[],
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor,
>(
  parserA: Parser<A, ExpectedA, Input, Data, Cursor, T, FormattedCursor>,
  parserB: Parser<B, ExpectedB, Input, Data, Cursor, T, FormattedCursor>,
): Parser<
  [A, B],
  ExpectedA | ExpectedB,
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor
> =>
(reader, data) => {
  const a = parserA(reader, data);
  if (!a[0]) return a;
  const [, valueA, nextA] = a;
  const b = parserB(reader, nextA);
  if (!b[0]) return b;
  return [true, [valueA, b[1]], b[2]];
};
