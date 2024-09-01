import { merge } from "./context.ts";
import type { Parser } from "./parse.ts";
import { isFail } from "./action.ts";

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
export const chain =
  <A, B>(parser: Parser<A>, fn: (value: A) => Parser<B>): Parser<B> =>
  (context) => {
    const a = parser(context);
    if (isFail(a)) return a;
    const parserB = fn(a.value);
    return merge(a, parserB([context[0], a.location]));
  };
