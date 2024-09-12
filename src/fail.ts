import type { Parser } from "./parser.ts";
import { makeExpected } from "./expected.ts";

/**
 * Returns a parser that fails with the given array of strings `expected` and consumes no input.
 * Usually used in the `else` branch of a {@linkcode chain} function.
 *
 * > [!NOTE]
 * > Expected messages are are typically displayed as part of a comma
 * > separated list of "expected" values, like "expected list, number, object", so
 * > it's best to keep your failure messages limited to nouns. If you used a message
 * > like "number too big" instead, then you might end up showing the user an error
 * > message like "expected number too big" which doesn't make any sense at all.
 *
 * @example
 * ```ts
 * import { chain, fail, match, ok, tryParse } from "@takker/parser";
 *
 * const number = chain(match(/[0-9]+/), (s) => {
 *   const n = Number(s);
 *   if (Number.isFinite(n)) {
 *     return ok(n);
 *   } else {
 *     return fail(["smaller number"]);
 *   }
 * });
 *
 * tryParse(number, "1984");
 * // => 1984
 *
 * tryParse(number, "9".repeat(999));
 * // => error: expected smaller number
 * ```
 */
export const fail = (
  expected: string[],
): Parser<never> =>
(reader, ...context) => {
  return [false, context, [makeExpected(reader, context, ...expected)]];
};
