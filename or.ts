import { merge } from "./context.ts";
import type { Parser } from "./parse.ts";
import { isOk } from "./action.ts";

/**
 * Try to parse using `parserA`. If that fails, parse using `parserB`.
 *
 * This is good for parsing things like _expressions_ or _statements_ in
 * programming languages, where many different types of things are applicable.
 *
 * See {@linkcode choice} for additional information.
 *
 * @example
 * ```ts
 * import { ok, or, text, tryParse } from "@takker/parser";
 *
 * const a = text("a");
 * const b = text("b");
 * const ab = or(a, b);
 * tryParse(ab, "a"); // => "a"
 * tryParse(ab, "b"); // => "b"
 *
 * // You can also use this to implement optional parsers
 * const aMaybe = or(text("a"), ok(null));
 * tryParse(aMaybe, "a"); // => "a"
 * tryParse(aMaybe, ""); // => null
 * ```
 */
export const or = <A, B, I extends ArrayLike<unknown>>(
  parserA: Parser<A, I>,
  parserB: Parser<B, I>,
): Parser<A | B, I> =>
(context) => {
  const a = parserA(context);
  if (isOk(a)) return a;
  return merge(a, parserB(context));
};
