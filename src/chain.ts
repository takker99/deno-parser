import { isFail, type Parser } from "./parse.ts";
import { merge } from "./merge.ts";

/**
 * Parse using the current parser. If it succeeds, pass the value to the `fn`
 * function, which returns the next parser to use. Similar to {@linkcode and}, but you get to
 * choose which parser comes next based on the value of the first one.
 *
 * This is good for parsing things like _expressions_ or _statements_ in
 * programming languages, where many different types of things are applicable.
 *
 * @example
 * ```ts
 * import { chain, choice, map, match, skip, text, tryParse, wrap } from "@takker/parser";
 * import { assertEquals } from "@std/assert";
 *
 * const openingTag = wrap(text("<"), match(/\w+/), text(">"));
 * const closingTag = (tag: string) => wrap(text("</"), text(tag), text(">"));
 * const xmlTag = chain(openingTag, (tag) =>
 *   map(
 *     skip(match(/[^<]+|/), closingTag(tag)),
 *     (content) => [tag, content] as const,
 *   ));
 *
 * assertEquals(tryParse(xmlTag, "<body></body>"), ["body", ""]);
 * assertEquals(tryParse(xmlTag, "<meta>data</meta>"), ["meta", "data"]);
 * ```
 */
export const chain = <
  A,
  B,
  Input extends ArrayLike<unknown>,
>(
  parser: Parser<A, Input>,
  fn: (value: A) => Parser<B, Input>,
): Parser<B, Input> =>
(input, prev, options) => {
  const a = parser(input, prev, options);
  if (isFail(a)) return a;
  return merge(a, fn(a.value)(input, a.next, options));
};
