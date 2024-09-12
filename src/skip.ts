import { chain } from "./chain.ts";
import { map } from "./map.ts";
import type { Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";

/**
 * Combines `parserA` and `parserB` one after the other, yielding the result of `parserA`.
 *
 * @example
 * ```ts
 * import { skip, text } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * const a = text("a");
 * const b = text("b");
 * const ab = skip(a, b);
 * Deno.test("skip", () => {
 *   assertEquals(tryParse(ab, "ab"), "a");
 * });
 * ```
 */
export const skip = <A, B, const Reader extends BaseReader>(
  parserA: Parser<A, Reader>,
  parserB: Parser<B, Reader>,
): Parser<A, Reader> => chain(parserA, (a) => map(parserB, () => a));
