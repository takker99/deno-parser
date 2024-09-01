import { next } from "./next.ts";
import type { Parser } from "./parse.ts";
import { skip } from "./skip.ts";

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
export const wrap = <B, A, C>(
  before: Parser<B>,
  parser: Parser<A>,
  after: Parser<C>,
): Parser<A> => skip(next(before, parser), after);
