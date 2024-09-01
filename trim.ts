import type { Parser } from "./parse.ts";
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
export const trim = <A, B, I extends ArrayLike<unknown>>(
  parser: Parser<A, I>,
  beforeAndAfter: Parser<B, I>,
): Parser<A, I> => wrap(beforeAndAfter, parser, beforeAndAfter);
