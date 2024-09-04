import { next } from "./next.ts";
import { skip } from "./skip.ts";
import type { Parser } from "./parser.ts";

/**
 * Returns a parser that parses `before`, `parser`, and `after` in that
 * order, yielding only the value from `parser`.
 *
 * Useful for adding the brackets onto an array parser, object parser, or argument
 * list parser, for example.
 *
 * @example
 * ```ts
 * import { sepBy, text, tryParse, wrap } from "@takker/parser";
 *
 * const item = text("a");
 * const comma = text(",");
 * const lbrack = text("[");
 * const rbrack = text("]");
 * const list = wrap(lbrack, sepBy(item, comma), rbrack);
 * tryParse(list, "[a,a,a]"); // => ["a", "a", "a"]
 * ```
 */
export const wrap = <
  L,
  const ExpectedL extends string[],
  A,
  const ExpectedA extends string[],
  R,
  const ExpectedR extends string[],
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor,
>(
  left: Parser<L, ExpectedL, Input, Data, Cursor, T, FormattedCursor>,
  parser: Parser<A, ExpectedA, Input, Data, Cursor, T, FormattedCursor>,
  right: Parser<R, ExpectedR, Input, Data, Cursor, T, FormattedCursor>,
): Parser<
  A,
  ExpectedL | ExpectedA | ExpectedR,
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor
> => next(left, skip(parser, right));
