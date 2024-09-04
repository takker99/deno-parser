import { and } from "./and.ts";
import { map } from "./map.ts";
import type { Parser } from "./parser.ts";

/**
 * Combines `parserA` and `parserB` one after the other, yielding the result of `parserB`.
 *
 * @example
 * ```ts
 * import { next, text, tryParse } from "@takker/parser";
 *
 * const a = text("a");
 * const b = text("b");
 * const ab = next(a, b);
 * tryParse(ab, "ab");
 * // => "b"
 * ```
 */
export const next = <
  L,
  const ExpectedL extends string[],
  A,
  const Expected extends string[],
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor,
>(
  before: Parser<L, ExpectedL, Input, Data, Cursor, T, FormattedCursor>,
  parser: Parser<A, Expected, Input, Data, Cursor, T, FormattedCursor>,
): Parser<A, ExpectedL | Expected, Input, Data, Cursor, T, FormattedCursor> =>
  map(and(before, parser), ([, b]) => b);
