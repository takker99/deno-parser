import { chain } from "./chain.ts";
import { map } from "./map.ts";
import type { Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";

/**
 * Combines two parsers one after the other, yielding the results of both in
 * an array.
 *
 * @example
 * ```ts
 * import { and, text } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * const a = text("a");
 * const b = text("b");
 * const ab = and(a, b);
 *
 * Deno.test("and", () => {
 *  assertEquals(tryParse(ab, "ab"), ["a", "b"]);
 * });
 * ```
 */
export const and = <A, B, const Reader extends BaseReader>(
  parserA: Parser<A, Reader>,
  parserB: Parser<B, Reader>,
): Parser<[A, B], Reader> => chain(parserA, (a) => map(parserB, (b) => [a, b]));
