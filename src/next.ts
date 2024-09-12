import { chain } from "./chain.ts";
import type { Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";

/**
 * Combines `parserA` and `parserB` one after the other, yielding the result of `parserB`.
 *
 * @example
 * ```ts
 * import { next, text } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * const a = text("a");
 * const b = text("b");
 * const ab = next(a, b);
 * Deno.test("next", () => {
 *   assertEquals(tryParse(ab, "ab"), "b");
 * });
 * ```
 */
export const next = <A, B, const Reader extends BaseReader>(
  parserA: Parser<A, Reader>,
  parserB: Parser<B, Reader>,
): Parser<B, Reader> => chain(parserA, () => parserB);
