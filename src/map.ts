import { chain } from "./chain.ts";
import { ok } from "./ok.ts";
import type { Parser } from "./parse.ts";

/**
 * Yields the result of calling `fn` with the parser's value.
 *
 * @example
 * ```ts
 * import { map, match, or, text, tryParse } from "@takker/parser";
 * import { assertEquals } from "@std/assert";
 *
 * const num = map(match(/[0-9]+/), (str) => Number(str));
 * assertEquals(tryParse(num, "1312"), 1312);
 * assertEquals(tryParse(num, "777"), 777);
 *
 * const yes = map(text("yes"), () => true as const);
 * const no = map(text("no"), () => false as const);
 * const bool = or(yes, no);
 * assertEquals(tryParse(bool, "yes"), true);
 * assertEquals(tryParse(bool, "no"), false);
 * ```
 */
export const map = <A, B, I extends ArrayLike<unknown>>(
  parser: Parser<A, I>,
  fn: (value: A) => B,
): Parser<B, I> => chain(parser, (a) => ok(fn(a)));
