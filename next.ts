import { and } from "./and.ts";
import { map } from "./map.ts";
import type { Parser } from "./parse.ts";

/**
 * Combines `parserA` and `parserB` one after the other, yielding the result of `parserB`.
 *
 * @example
 * ```ts
 * import { next, text, tryParse } from "@takker/parser";
 *
 * const a = text("a");
 * const b = text("b");
 * const ab = next(a, b);
 * tryParse(ab, "ab");
 * // => "b"
 * ```
 */
export const next = <A, B>(parserA: Parser<A>, parserB: Parser<B>): Parser<B> =>
  map(and(parserA, parserB), ([, b]) => b);
