import { and } from "./and.ts";
import { map } from "./map.ts";
import type { Parser } from "./parse.ts";

/**
 * Combines `parserA` and `parserB` one after the other, yielding the result of `parserA`.
 *
 * @example
 * ```ts
 * import { skip, text, tryParse } from "@takker/parser";
 *
 * const a = text("a");
 * const b = text("b");
 * const ab = skip(a, b);
 * tryParse(ab, "ab");
 * // => "a"
 * ```
 */
export const skip = <A, B>(parserA: Parser<A>, parserB: Parser<B>): Parser<A> =>
  map(and(parserA, parserB), ([a]) => a);
