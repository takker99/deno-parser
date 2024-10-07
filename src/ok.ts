import type { Parser } from "./parse.ts";
import { defaultLocation } from "./SourceLocation.ts";

/**
 * Returns a parser that yields the given `value` and consumes no input.
 *
 * Usually used as a fallback parser in case you want the option of parsing nothing
 * at all.
 *
 * @example
 * ```ts
 * import { choice, ok, text, tryParse } from "@takker/parser";
 * import { assertEquals } from "@std/assert";
 *
 * const sign = choice(text("+"), text("-"), ok(""));
 * assertEquals(tryParse(sign, "+"), "+");
 * assertEquals(tryParse(sign, "-"), "-");
 * assertEquals(tryParse(sign, ""), "");
 * ```
 */
export const ok =
  <A, I extends ArrayLike<unknown>>(value: A): Parser<A, I> =>
  (_, next = defaultLocation) => ({ ok: true, value, expected: [], next });
