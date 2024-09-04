import { and } from "./and.ts";
import { map } from "./map.ts";
import type { Parser } from "./parser.ts";

/**
 * Combines `parserA` and `parserB` one after the other, yielding the result of `parserA`.
 *
 * @example
 * ```ts
 * import { skip, text, tryParse } from "@takker/parser";
 *
 * const a = text("a");
 * const b = text("b");
 * const ab = skip(a, b);
 * tryParse(ab, "ab");
 * // => "a"
 * ```
 */
export const skip = <
  A,
  const Expected extends string[],
  R,
  const ExpectedR extends string[],
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor,
>(
  parser: Parser<A, Expected, Input, Data, Cursor, T, FormattedCursor>,
  after: Parser<R, ExpectedR, Input, Data, Cursor, T, FormattedCursor>,
): Parser<A, Expected | ExpectedR, Input, Data, Cursor, T, FormattedCursor> =>
  map(and(parser, after), ([a]) => a);
