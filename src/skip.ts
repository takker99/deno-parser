import { and } from "./and.ts";
import { map } from "./map.ts";
import type { Parser } from "./parse.ts";

/**
 * Combines `parserA` and `parserB` one after the other, yielding the result of `parserA`.
 *
 * @example
 * ```ts
 * import { skip, text, tryParse } from "@takker/parser";
 * import { assertThrows } from "@std/assert";
 *
 * const a = text("a");
 * const b = text("b");
 * const ab = skip(a, b);
 * assertThrows(() => tryParse(ab, "a"));
 * ```
 */
export const skip = <A, B, I extends ArrayLike<unknown>>(
  parserA: Parser<A, I>,
  parserB: Parser<B, I>,
): Parser<A, I> => map(and(parserA, parserB), ([a]) => a);
