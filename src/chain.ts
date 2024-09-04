import type { Parser } from "./parser.ts";
import type { DeepReadonly } from "./deep_readonly.ts";

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
 *
 * const openingTag = wrap(text("<"), match(/\w+/), text(">"));
 * const closingTag = (tag: string) => wrap(text("</"), text(tag), text(">"));
 * const xmlTag = chain(openingTag, (tag) =>
 *   map(
 *     skip(match(/[^<]+|/), closingTag(tag)),
 *     (content) => [tag, content] as const,
 *   ));
 *
 * tryParse(xmlTag, "<body></body>"); // => ["body", ""]
 * tryParse(xmlTag, "<meta>data</meta>"); // => ["meta", "data"]
 * ```
 */
export const chain = <
  A,
  const ExpectedA extends string[],
  B,
  const ExpectedB extends string[],
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor,
>(
  parser: Parser<A, ExpectedA, Input, Data, Cursor, T, FormattedCursor>,
  fn: (
    value: DeepReadonly<A>,
  ) => Parser<B, ExpectedB, Input, Data, Cursor, T, FormattedCursor>,
): Parser<
  B,
  ExpectedA | ExpectedB,
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor
> =>
(reader, data) => {
  const a = parser(reader, data);
  if (!a[0]) return a;
  return fn(a[1])(reader, a[2]);
};
