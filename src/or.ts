import { isOk, type Parser } from "./parse.ts";
import { merge } from "./merge.ts";

/**
 * Try to parse using `parserA`. If that fails, parse using `parserB`.
 *
 * This is good for parsing things like _expressions_ or _statements_ in
 * programming languages, where many different types of things are applicable.
 *
 * See {@linkcode choice} for additional information.
 *
 * @example Basic usage
 * ```ts
 * import { or, text, tryParse } from "@takker/parser";
 * import { assertEquals } from "@std/assert";
 *
 * const a = text("a");
 * const b = text("b");
 * const ab = or(a, b);
 * assertEquals(tryParse(ab, "a"), "a");
 * assertEquals(tryParse(ab, "b"), "b");
 * ```
 *
 * @example Optional parsers
 * ```ts
 * import { ok, or, text, tryParse } from "@takker/parser";
 * import { assertEquals } from "@std/assert";
 *
 * // You can also use this to implement optional parsers
 * const aMaybe = or(text("a"), ok(null));
 * assertEquals(tryParse(aMaybe, "a"), "a");
 * assertEquals(tryParse(aMaybe, ""), null);
 * ```
 */
export const or = <A, B, I extends ArrayLike<unknown>>(
  parserA: Parser<A, I>,
  parserB: Parser<B, I>,
): Parser<A | B, I> =>
(...args) => {
  const a = parserA(...args);
  if (isOk(a)) return a;
  return merge(a, parserB(...args));
};
