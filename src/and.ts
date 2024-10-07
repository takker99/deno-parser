import type { Parser } from "./parse.ts";
import { chain } from "./chain.ts";
import { map } from "./map.ts";

/**
 * Combines two parsers one after the other, yielding the results of both in
 * an array.
 *
 * @example
 * ```ts
 * import { and, text, tryParse } from "@takker/parser";
 * import { assertThrows } from "@std/assert";
 *
 * const a = text("a");
 * const b = text("b");
 * const ab = and(a, b);
 * assertThrows(() => tryParse(ab, "a"), "at line 1 column 2: expected a, b");
 * ```
 */
export const and = <A, B, Input extends ArrayLike<unknown>>(
  parserA: Parser<A, Input>,
  parserB: Parser<B, Input>,
): Parser<[A, B], Input> => chain(parserA, (a) => map(parserB, (b) => [a, b]));
