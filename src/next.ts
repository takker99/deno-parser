import { and } from "./and.ts";
import { map } from "./map.ts";
import type { Parser } from "./parse.ts";

/**
 * Combines `parserA` and `parserB` one after the other, yielding the result of `parserB`.
 *
 * @example
 * ```ts
 * import { next, text, tryParse } from "@takker/parser";
 * import { assertEquals } from "@std/assert";
 *
 * const a = text("a");
 * const b = text("b");
 * const ab = next(a, b);
 * assertEquals(tryParse(ab, "ab"), "b");
 * ```
 */
export const next = <A, B, I extends ArrayLike<unknown>>(
  parserA: Parser<A, I>,
  parserB: Parser<B, I>,
): Parser<B, I> => map(and(parserA, parserB), ([, b]) => b);
