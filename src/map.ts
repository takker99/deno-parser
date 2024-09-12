import { chain } from "./chain.ts";
import { ok } from "./ok.ts";
import type { Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";

/**
 * Yields the result of calling `fn` with the parser's value.
 *
 * @example
 * ```ts
 * import { map, match, or, text } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * Deno.test("map", () => {
 *   const num = map(match(/[0-9]+/), (str) => Number(str));
 *   assertEquals(tryParse(num, "1312"), 1312);
 *   assertEquals(tryParse(num, "777"), 777);
 *
 *   const yes = map(text("yes"), () => true);
 *   const no = map(text("no"), () => false);
 *   const bool = or(yes, no);
 *   assertEquals(tryParse(bool, "yes"), true);
 *   assertEquals(tryParse(bool, "no"), false);
 * });
 * ```
 */
export const map = <A, const B, const Reader extends BaseReader>(
  parser: Parser<A, Reader>,
  fn: (value: A) => B,
): Parser<B, Reader> => chain(parser, (a) => ok(fn(a)));
