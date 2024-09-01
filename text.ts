import { contextFail, contextOk } from "./context.ts";
import type { Parser } from "./parse.ts";

/** Returns a parser that matches the exact `string` supplied.
 *
 * This is typically used for things like parsing keywords (`for`, `while`, `if`,
 * `else`, `let`...), or parsing static characters such as `{`, `}`, `"`, `'`...
 *
 * @example
 * ```ts
 * import { and, text, tryParse } from "@takker/parser";
 *
 * const keywordWhile = text("while");
 * const paren = and(text("("), text(")"));
 * tryParse(keywordWhile, "while"); // => "while"
 * tryParse(paren, "()"); // => ["(", ")"]
 * ```
 */
export const text = <A extends string>(string: A): Parser<A> => (context) => {
  const [input, [start]] = context;
  const end = start + string.length;
  if (input.slice(start, end) == string) {
    return contextOk(context, end, string);
  }
  return contextFail(context, start, [string]);
};
