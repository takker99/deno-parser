import type { Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";
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
 * @example
 * ```ts
 * import { match, ok, or, text, trim } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * const whitespace = match(/\s+/);
 * const optWhitespace = or(whitespace, ok(""));
 * const item = trim(text("a"), optWhitespace);
 * Deno.test("trim", () => {
 *   assertEquals(tryParse(item, " a\n"), "a");
 * });
 * ```
 */
export const trim = <A, B, const Reader extends BaseReader>(
  parser: Parser<A, Reader>,
  beforeAndAfter: Parser<B, Reader>,
): Parser<A, Reader> => wrap(beforeAndAfter, parser, beforeAndAfter);
