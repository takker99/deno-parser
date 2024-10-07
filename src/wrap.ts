import { next } from "./next.ts";
import { skip } from "./skip.ts";
import type { Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";

/**
 * Returns a parser that parses `before`, `parser`, and `after` in that
 * order, yielding only the value from `parser`.
 *
 * Useful for adding the brackets onto an array parser, object parser, or argument
 * list parser, for example.
 *
 * @example
 * ```ts
 * import { sepBy, text, wrap } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * const item = text("a");
 * const comma = text(",");
 * const lbrack = text("[");
 * const rbrack = text("]");
 * const list = wrap(lbrack, sepBy(item, comma), rbrack);
 * Deno.test("wrap", () => {
 *   assertEquals(tryParse(list, "[a,a,a]"), ["a", "a", "a"]);
 * });
 * ```
 */
export const wrap = <L, A, R, const Reader extends BaseReader>(
  parserL: Parser<L, Reader>,
  parserA: Parser<A, Reader>,
  parserR: Parser<R, Reader>,
): Parser<A, Reader> => next(parserL, skip(parserA, parserR));
