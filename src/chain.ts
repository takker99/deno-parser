import { isOk, merge, type Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";

/**
 * Parse using the current `parser`. If it succeeds, pass the value to the `fn`
 * function, which returns the next parser to use. Similar to {@linkcode and}, but you get to
 * choose which parser comes next based on the value of the first one.
 *
 * This is good for parsing things like _expressions_ or _statements_ in
 * programming languages, where many different types of things are applicable.
 *
 * @example
 * ```ts
 * import { chain, map, match, and, text, wrap } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * const openingTag = wrap(text("<"), match(/\w+/), text(">"));
 * const closingTag = (tag: string) => wrap(text("</"), text(tag), text(">"));
 * const xmlTag = chain(openingTag, (tag) =>
 *   map(
 *     and(match(/[^<]+|/), closingTag(tag)),
 *     ([content]) => [tag, content],
 *   ));
 *
 * Deno.test("chain", () => {
 *  assertEquals(tryParse(xmlTag, "<body></body>"), ["body", ""]);
 *  assertEquals(tryParse(xmlTag, "<meta>data</meta>"), ["meta", "data"]);
 * });
 * ```
 */
export const chain = <A, B, const Reader extends BaseReader>(
  parser: Parser<A, Reader>,
  fn: (value: A) => Parser<B, Reader>,
): Parser<B, Reader> =>
(reader, ...context) => {
  const a = parser(reader, ...context);
  if (!isOk(a)) return a;
  return merge(reader, a, fn(a[3])(reader, ...a[1]));
};
