import type { DeepReadonly } from "./deep_readonly.ts";
import type { Parser } from "./parser.ts";
import { getNextCursor, pop } from "./reader.ts";

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
export const text = <
  Input,
  Data,
  Cursor,
  const T extends string,
  FormattedCursor,
  const S extends T,
>(string: S): Parser<S, [S], Input, Data, Cursor, T, FormattedCursor> =>
(reader, data) => {
  const [sliced, next] = pop(reader, data, string.length);
  if (sliced == string) {
    return [true, string as DeepReadonly<S>, next];
  }
  return [false, getNextCursor(reader, data), next, [string]];
};
