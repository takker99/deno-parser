import type { Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";

/**
 * Returns a parser that yields the given `value` and consumes no input.
 *
 * Usually used as a fallback parser in case you want the option of parsing nothing
 * at all.
 *
 * @example
 * ```ts
 * import { choice, ok, text } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * const sign = choice(text("+"), text("-"), ok("default"));
 * Deno.test("ok", () => {
 *   assertEquals(tryParse(sign, "+"), "+");
 *   assertEquals(tryParse(sign, "-"), "-");
 *   assertEquals(tryParse(sign, ""), "default");
 * });
 * ```
 */
export const ok =
  <const A, const Reader extends BaseReader>(value: A): Parser<A, Reader> =>
  (_, ...context) => [true, context, [], value];
