import type { Parser } from "./parser.ts";
import { wrap } from "./wrap.ts";

/**
 * Returns a parser that parses `beforeAndAfter`, `parser`, and then `beforeAndAfter`
 * again, in that order, yielding only the value from `parser`.
 *
 * Generally used with a parser that parses optional whitespace.
 *
 * > [!NOTE]
 * > Whitespace parsers typically also parse code comments, since those are
 * > generally ignored when parsing, just like whitespace.
 *
 * ```ts
 * import { match, ok, or, text, trim, tryParse } from "@takker/parser";
 *
 * const whitespace = match(/\s+/);
 * const optWhitespace = or(whitespace, ok(""));
 * const item = trim(text("a"), optWhitespace);
 * tryParse(item, "     a "); // => "a"
 * ```
 */
export const trim = <
  A,
  const Expected extends string[],
  B,
  const ExpectedB extends string[],
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor,
>(
  parser: Parser<A, Expected, Input, Data, Cursor, T, FormattedCursor>,
  beforeAndAfter: Parser<B, ExpectedB, Input, Data, Cursor, T, FormattedCursor>,
): Parser<A, Expected | ExpectedB, Input, Data, Cursor, T, FormattedCursor> =>
  wrap(beforeAndAfter, parser, beforeAndAfter);
